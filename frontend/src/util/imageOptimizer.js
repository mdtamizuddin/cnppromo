/**
 * Client-side image optimization utility using the HTML5 Canvas API.
 * Compresses and resizes raster images (JPG, PNG, WebP, etc.) before upload.
 * Preserves SVG vectors and animated GIFs.
 */

/**
 * Optimizes an image File or Blob on the client side before uploading.
 *
 * @param {File|Blob} file - The original image file.
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1920] - Maximum width in pixels.
 * @param {number} [options.maxHeight=1920] - Maximum height in pixels.
 * @param {number} [options.quality=0.82] - WebP/JPEG compression quality (0.0 to 1.0).
 * @param {string} [options.format='image/webp'] - Target MIME format ('image/webp' or 'image/jpeg').
 * @returns {Promise<File|Blob>} - The optimized image, or original file if compression not applicable.
 */
export async function optimizeImage(file, options = {}) {
  // If not a file or not an image, return as-is
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // Preserve SVGs (vector graphics) and GIFs (which may be animated)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    format = 'image/webp',
  } = options;

  return new Promise((resolve) => {
    // Create image element to load source file
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Only resize if image dimensions exceed maximum thresholds
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      // Create offscreen canvas for rendering
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file); // Fallback to original if context not supported
      }

      // High quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to modern WebP blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          // If the optimized file is actually smaller, use it
          if (blob.size < file.size) {
            const originalName = file.name || 'image';
            const baseName = originalName.replace(/\.[^/.]+$/, '');
            const ext = format === 'image/webp' ? 'webp' : 'jpg';
            const optimizedFile = new File([blob], `${baseName}.${ext}`, {
              type: format,
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            // Keep original if it's already smaller (e.g. tiny icons)
            resolve(file);
          }
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original on load error
    };

    img.src = objectUrl;
  });
}
