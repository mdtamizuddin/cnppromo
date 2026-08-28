const { Router } = require('express');
const multer = require('multer');
const AWS = require("@aws-sdk/client-s3");
const { S3Client, PutObjectCommand } = AWS;
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
  requestHandler: new NodeHttpHandler({ httpAgent: customAgent }),
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'cnppromo-files';

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpdir()),
  filename: (req, file, cb) => {
    const sanitized = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${uuidv4()}_${sanitized}`);
  }
});

// Allowed MIME type filters
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];
const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/aac'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg'];

const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type. Allowed: JPG, PNG, WebP, GIF, AVIF'));
    }
  }
});

const uploadAudio = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (allowedAudioTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type. Allowed: MP3, WAV, WebM, OGG'));
    }
  }
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (allowedVideoTypes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video file type. Allowed: MP4, WebM, MOV, MKV'));
    }
  }
});

// Upload file to S3 helper with cleanup
async function uploadToS3(file, folder = '') {
  const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${folder}/${uuidv4()}_${sanitizedName}`;
  const buffer = await fs.promises.readFile(file.path);

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
      })
    );
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
  } finally {
    // Clean up temporary file from disk
    fs.promises.unlink(file.path).catch(() => {});
  }
}

// Upload Image to S3
router.post('/', uploadImage.single('image'), async (req, res) => {
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
router.post('/file', uploadAudio.single('audio'), async (req, res) => {
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
router.post('/video', uploadVideo.single('video'), async (req, res) => {
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

module.exports = router;