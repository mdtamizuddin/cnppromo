const { Router } = require('express');
const AWS = require("@aws-sdk/client-s3");
const { S3Client, PutObjectCommand } = AWS;
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const path = require('path');
const https = require('https');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');
const router = Router();

// MongoDB File schema for tracking uploaded file records
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
  alac: 'audio/alac',
  amr: 'audio/amr',
};

// Helper to build dynamic time-partitioned folder: e.g. "message/image/september-2026"
function getDynamicFolderPath(folder = 'uploads') {
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const year = now.getFullYear();
  const monthYear = `${monthName}-${year}`;

  const cleanFolder = (folder || 'uploads').replace(/^\/+|\/+$/g, '');
  return `${cleanFolder}/${monthYear}`;
}

/**
 * POST /api/v1/upload/presign
 * Generates a signed AWS S3 PUT URL for direct frontend uploads.
 * Allowed: Images, Videos, Audios only.
 * Body: { fileName, fileType, folder }
 */
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

    // Strictly validate that the file is an image, video, or audio
    const isAllowedMedia = contentType && (
      contentType.startsWith('image/') ||
      contentType.startsWith('video/') ||
      contentType.startsWith('audio/') ||
      contentType === 'application/x-matroska'
    );

    if (!isAllowedMedia) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only image, video, and audio files are allowed.'
      });
    }

    const dynamicFolder = getDynamicFolderPath(folder);
    const sanitizedName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${dynamicFolder}/${uuidv4()}_${sanitizedName}`;

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
      folder: dynamicFolder,
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

/**
 * POST /api/v1/upload/record
 * Optional helper to persist uploaded file metadata in MongoDB.
 * Body: { path, type, info }
 */
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