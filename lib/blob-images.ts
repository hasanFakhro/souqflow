import { put } from "@vercel/blob";
import { IMAGE_TYPES, validateImageFile } from "@/lib/image-file";

export class ImageUploadError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ImageUploadError";
  }
}

export async function uploadImage(file: File, directory: string) {
  const validationError = validateImageFile(file);
  if (validationError) throw new ImageUploadError(validationError, 400);
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new ImageUploadError(
      "Image storage is not configured. Please contact support.",
      503,
    );
  }
  const extension = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
  const blob = await put(`${directory}/image.${extension}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });
  return blob.url;
}
