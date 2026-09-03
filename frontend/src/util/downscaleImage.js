/**
 * Downscales an image File client-side before upload. Typical phone
 * screenshots are 1-3MB against the 10MB server cap; this brings them to a
 * few hundred KB, which matters far more for upload speed on the mobile
 * connections most workers are on than it does for storage.
 *
 * Falls back to the original File on ANY error — a downscaling bug must
 * never block a submission.
 */
export const downscaleImage = async (file, { maxEdge = 1600, quality = 0.8 } = {}) => {
  try {
    if (!file || !file.type?.startsWith("image/")) return file;

    // imageOrientation: "from-image" honours EXIF rotation — without it,
    // portrait phone screenshots upload sideways in several browsers.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = bitmap;
    const longEdge = Math.max(width, height);

    // Already small enough — skip re-encoding entirely.
    if (longEdge <= maxEdge && file.size < 400 * 1024) {
      bitmap.close?.();
      return file;
    }

    const scale = Math.min(1, maxEdge / longEdge);
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close?.();

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", quality);
    });

    const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch (error) {
    console.warn("downscaleImage: falling back to original file —", error?.message);
    return file;
  }
};
