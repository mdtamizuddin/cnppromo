/**
 * Pull the video id out of the common YouTube URL shapes. Used by the
 * marketplace's WATCH gate player and by admin/feed thumbnails.
 */
export const youtubeId = (url) => {
  if (!url) return null;
  const match = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

export const youtubeThumb = (url) => {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};
