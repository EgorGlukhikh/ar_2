const AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/webm",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-m4v",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".aac", ".wav", ".ogg", ".webm"];
const VIDEO_EXTENSIONS = [".mp4", ".m4v", ".mov", ".webm", ".ogg"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

function hasAllowedExtension(filename: string, extensions: string[]) {
  const lowerName = filename.trim().toLowerCase();
  return extensions.some((extension) => lowerName.endsWith(extension));
}

export function isAllowedAudioFile(file: File) {
  return (
    AUDIO_MIME_TYPES.has(file.type.toLowerCase()) ||
    hasAllowedExtension(file.name, AUDIO_EXTENSIONS)
  );
}

export function isAllowedVideoFile(file: File) {
  return (
    VIDEO_MIME_TYPES.has(file.type.toLowerCase()) ||
    hasAllowedExtension(file.name, VIDEO_EXTENSIONS)
  );
}

export function isAllowedImageFile(file: File) {
  return (
    IMAGE_MIME_TYPES.has(file.type.toLowerCase()) ||
    hasAllowedExtension(file.name, IMAGE_EXTENSIONS)
  );
}
