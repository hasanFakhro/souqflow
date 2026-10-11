export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;
export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPES).join(",");

export function validateImageFile(file: Pick<File, "size" | "type">) {
  if (!Object.hasOwn(IMAGE_TYPES, file.type)) {
    return "Choose a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size === 0) return "Choose a non-empty image file.";
  if (file.size > MAX_IMAGE_SIZE) return "Image must be 4 MB or smaller.";
  return null;
}
