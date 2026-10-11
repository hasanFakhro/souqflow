import {
  BlobAccessError,
  BlobStoreNotFoundError,
  BlobStoreSuspendedError,
  put,
} from "@vercel/blob";
import { IMAGE_TYPES, validateImageFile } from "@/lib/image-file";

export class ImageUploadError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ImageUploadError";
  }
}

export function imageStorageError(error: unknown) {
  if (error instanceof BlobAccessError) {
    return new ImageUploadError("Image storage rejected access. Check the Blob read-write token in Vercel and redeploy.", 503);
  }
  if (error instanceof BlobStoreNotFoundError) {
    return new ImageUploadError("The image storage connection points to a missing Blob store. Check the Vercel storage connection.", 503);
  }
  if (error instanceof BlobStoreSuspendedError) {
    return new ImageUploadError("Image storage is suspended. Check the Blob store status in Vercel.", 503);
  }
  if (error instanceof Error && /private/i.test(error.message) && /public|access/i.test(error.message)) {
    return new ImageUploadError("This app requires a public Blob store for images. The connected store is private.", 503);
  }
  return new ImageUploadError("Image upload failed. Please try again. If it continues, check the image storage logs in Vercel.", 502);
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
  try {
    const blob = await put(`${directory}/image.${extension}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return blob.url;
  } catch (error) {
    console.error("Image storage upload failed:", error);
    throw imageStorageError(error);
  }
}
