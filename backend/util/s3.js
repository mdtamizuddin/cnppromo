const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const https = require('https');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');

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

/**
 * Extracts the S3 Key from a full URL or relative path.
 * e.g. "https://cnppromo-files.s3.ap-south-1.amazonaws.com/message/image/september-2026/xyz.jpg"
 * -> "message/image/september-2026/xyz.jpg"
 */
function extractS3Key(urlOrKey) {
  if (!urlOrKey || typeof urlOrKey !== "string") return null;
  try {
    if (urlOrKey.startsWith("http://") || urlOrKey.startsWith("https://")) {
      const parsed = new URL(urlOrKey);
      return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    }
    return urlOrKey.replace(/^\/+/, "");
  } catch {
    return urlOrKey.replace(/^\/+/, "");
  }
}

/**
 * Delete a file from AWS S3 given its full URL or key.
 */
async function deleteFromS3(urlOrKey) {
  const key = extractS3Key(urlOrKey);
  if (!key) return false;

  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    console.error(`[S3 Delete Error] Failed to delete ${key}:`, error.message);
    return false;
  }
}

module.exports = {
  s3,
  BUCKET_NAME,
  extractS3Key,
  deleteFromS3,
};
