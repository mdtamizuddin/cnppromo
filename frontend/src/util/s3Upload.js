import axios from 'axios';
import { api } from './axios';

/**
 * Upload any kind of file directly to AWS S3 using a Presigned PUT URL.
 * Works with any file type: Images, Videos, Audio, PDFs, Documents, Archives, Blobs, etc.
 *
 * @param {File|Blob} file - The file or blob to upload.
 * @param {string} [folder='uploads'] - Target folder in the S3 bucket ('images', 'videos', 'audio', 'documents', etc.).
 * @param {Function} [onProgress] - Optional progress callback (percent: number) => void.
 * @returns {Promise<string>} - Resolves to the public AWS S3 file URL.
 */
export async function uploadDirectToS3(file, folder = 'uploads', onProgress) {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // Handle both standard File objects and raw Blobs (e.g. MediaRecorder recordings)
  const inferredExt = file.type ? file.type.split('/')[1]?.split(';')[0]?.replace('x-', '') || 'bin' : 'bin';
  const fileName = file.name || `file_${Date.now()}.${inferredExt}`;
  const fileType = file.type || 'application/octet-stream';

  // 1. Request presigned PUT URL from backend
  const { data } = await api.post('/upload/presign', {
    fileName,
    fileType,
    folder,
  });

  if (!data?.success || !data?.uploadUrl) {
    throw new Error(data?.message || 'Failed to generate S3 upload URL');
  }

  // 2. Upload file binary directly to AWS S3 using standard axios
  // (Do NOT include backend Authorization token in the S3 request)
  await axios.put(data.uploadUrl, file, {
    headers: {
      'Content-Type': data.contentType || fileType,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  // 3. Return the final public S3 file URL
  return data.fileUrl;
}

/**
 * Convenience helper for all image uploads (JPG, PNG, WebP, GIF, SVG, AVIF, HEIC, etc.)
 */
export async function uploadImageToS3(file, onProgress, folder = 'images') {
  return uploadDirectToS3(file, folder, onProgress);
}

/**
 * Convenience helper for all video uploads (MP4, WebM, MKV, MOV, AVI, etc.)
 */
export async function uploadVideoToS3(file, onProgress, folder = 'videos') {
  return uploadDirectToS3(file, folder, onProgress);
}

/**
 * Convenience helper for all audio uploads (MP3, WAV, WebM, OGG, AAC, voice recordings, etc.)
 */
export async function uploadAudioToS3(file, onProgress, folder = 'audio') {
  return uploadDirectToS3(file, folder, onProgress);
}

/**
 * Alias for media uploads
 */
export const uploadFileToS3 = uploadDirectToS3;
