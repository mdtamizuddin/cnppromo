const { Router } = require('express');
const multer = require('multer');
const AWS = require("@aws-sdk/client-s3");
const { S3Client, PutObjectCommand } = AWS;
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');
const { tmpdir } = require('os');
const router = Router();

// MongoDB schema
const schema = new mongoose.Schema({
  info: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
});

const File = mongoose.models.File || mongoose.model('File', schema);

const customAgent = new https.Agent({ keepAlive: true, maxSockets: 200 });

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  requestHandler: new NodeHttpHandler({ httpAgent: customAgent }),
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'cnppromo-files';

// Extension mappings for fallback ContentType resolution
const MIME_BY_EXT = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  heic: 'image/heic',
  heif: 'image/heif',
  jfif: 'image/jpeg',
  pjpeg: 'image/jpeg',
  pjp: 'image/jpeg',
  eps: 'image/eps',
  raw: 'image/x-raw',
  cr2: 'image/x-canon-cr2',
  nef: 'image/x-nikon-nef',
  // Videos
  mp4: 'video/mp4',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',
  m4v: 'video/mp4',
  '3gp': 'video/3gpp',
  '3g2': 'video/3gpp2',
  ogv: 'video/ogg',
  ts: 'video/mp2t',
  mts: 'video/mp2t',
  m2ts: 'video/mp2t',
  vob: 'video/dvd',
  qt: 'video/quicktime',
  asf: 'video/x-ms-asf',
  mpg: 'video/mpeg',
  mpeg: 'video/mpeg',
  m2v: 'video/mpeg',
  rm: 'application/vnd.rn-realmedia',
  rmvb: 'application/vnd.rn-realmedia-vbr',
  // Audios
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  flac: 'audio/flac',
  wma: 'audio/x-ms-wma',
  opus: 'audio/opus',
  mid: 'audio/midi',
  midi: 'audio/midi',
  aiff: 'audio/aiff',
  // Documents & PDFs
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv',
  txt: 'text/plain',
  rtf: 'application/rtf',
  // Archives
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  json: 'application/json',
  xml: 'application/xml',
};

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif|svg|bmp|tiff?|ico|heic|heif|jfif|pjpeg|pjp|raw|cr2|nef|orf|sr2|eps)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|mkv|mov|avi|wmv|flv|m4v|3gp|3g2|ogv|ts|mts|m2ts|vob|qt|asf|mpe?g|m2v|rm|rmvb)$/i;
const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus|mid|midi|aiff|alac|amr)$/i;

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpdir()),
  filename: (req, file, cb) => {
    const sanitized = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${uuidv4()}_${sanitized}`);
  }
});

// Multer instance for all image uploads
const uploadImage = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
    const isImageExt = IMAGE_EXTENSIONS.test(file.originalname);
    if (isImageMime || isImageExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type. Please upload a valid image file.'));
    }
  }
});

// Multer instance for all audio uploads
const uploadAudio = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const isAudioMime = file.mimetype && file.mimetype.startsWith('audio/');
    const isAudioExt = AUDIO_EXTENSIONS.test(file.originalname);
    if (isAudioMime || isAudioExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type. Please upload a valid audio file.'));
    }
  }
});

// Multer instance for all video uploads
const uploadVideo = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    const isVideoMime = file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype === 'application/x-matroska');
    const isVideoExt = VIDEO_EXTENSIONS.test(file.originalname);
    if (isVideoMime || isVideoExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video file type. Please upload a valid video file.'));
    }
  }
});

// Middleware wrapper to catch Multer errors cleanly and return 400
const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File is too large.' });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    }
    next();
  });
};

// Upload file to S3 helper with cleanup
async function uploadToS3(file, folder = '') {
  const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${folder}/${uuidv4()}_${sanitizedName}`;
  const buffer = await fs.promises.readFile(file.path);

  // Resolve accurate ContentType if browser sent application/octet-stream or empty
  let contentType = file.mimetype;
  if (!contentType || contentType === 'application/octet-stream') {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    contentType = MIME_BY_EXT[ext] || file.mimetype || 'application/octet-stream';
  }

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
  } finally {
    // Clean up temporary file from disk
    fs.promises.unlink(file.path).catch(() => {});
  }
}

// Upload Image to S3
router.post('/', handleUpload(uploadImage.single('image')), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send({
        success: false,
        message: 'No file uploaded',
      });
    }
    const url = await uploadToS3(file, 'images');
    res.json({
      success: true,
      message: 'Image uploaded successfully!',
      url,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).send({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// Upload Audio to S3
router.post('/file', handleUpload(uploadAudio.single('audio')), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No audio file provided' });
    }
    const url = await uploadToS3(req.file, 'audio');

    await File.create({
      info: req.file,
      path: url,
      type: req.file.fieldname
    });

    res.status(200).send({ message: 'Audio uploaded successfully', url });
  } catch (error) {
    console.error("Audio upload error:", error);
    res.status(500).send({ message: 'Upload failed', error: error.message });
  }
});

// Upload Video to S3
router.post('/video', handleUpload(uploadVideo.single('video')), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No video file provided' });
    }
    const url = await uploadToS3(req.file, 'videos');

    await File.create({
      info: req.file,
      path: url,
      type: req.file.fieldname
    });

    res.status(200).send({ message: 'Video uploaded successfully', url });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).send({ message: 'Upload failed', error: error.message });
  }
});

// Generate Presigned S3 Upload URL for direct frontend uploads
router.post('/presign', async (req, res) => {
  try {
    const { fileName, fileType, folder = 'uploads' } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'fileName is required'
      });
    }

    // Determine content type fallback if generic or missing
    let contentType = fileType;
    if (!contentType || contentType === 'application/octet-stream') {
      const ext = path.extname(fileName).toLowerCase().replace('.', '');
      contentType = MIME_BY_EXT[ext] || fileType || 'application/octet-stream';
    }

    const sanitizedName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${uuidv4()}_${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Presigned URL valid for 15 minutes (900 seconds)
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;

    res.json({
      success: true,
      uploadUrl,
      fileUrl,
      key,
      contentType
    });
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate presigned upload URL',
      error: error.message
    });
  }
});

// Optional record creation after direct S3 upload
router.post('/record', async (req, res) => {
  try {
    const { path: fileUrl, type = 'file', info = {} } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File path/url is required' });
    }

    const fileDoc = await File.create({
      path: fileUrl,
      type,
      info
    });

    res.status(201).json({ success: true, file: fileDoc });
  } catch (error) {
    console.error("File record creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;