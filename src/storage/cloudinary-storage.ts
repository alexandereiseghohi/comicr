import cloudinary from "cloudinary";

import { getEnv } from "@/lib/env";

import {
  type DeleteOptions,
  type DeleteResult,
  type ExistsResult,
  type GetUrlOptions,
  type StorageProvider,
  type UploadOptions,
  type UploadResponse,
} from "./types";

let isConfigured = false;

/**
 * Configure Cloudinary client
 */
function configureCloudinary(): void {
  if (isConfigured) return;

  const env = getEnv();
  cloudinary.v2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  isConfigured = true;
}

/**
 * Convert buffer to data URI for Cloudinary upload
 */
function bufferToDataUri(buffer: Buffer, contentType: string): string {
  const base64 = buffer.toString("base64");
  return `data:${contentType};base64,${base64}`;
}

/**
 * Cloudinary Storage Provider Implementation
 */
export class CloudinaryStorageProvider implements StorageProvider {
  readonly name = "cloudinary" as const;

  constructor() {
    configureCloudinary();
  }

  async upload(
    file: Blob | Buffer | ReadableStream,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    try {
      configureCloudinary();

      // Convert to Buffer
      let buffer: Buffer;
      if (file instanceof Buffer) {
        buffer = file;
      } else if (typeof Blob !== "undefined" && file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else if (file && typeof (file as any).pipe === "function") {
        // Node.js Readable Stream
        buffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          (file as any).on("data", (chunk: Buffer) => chunks.push(chunk));
          (file as any).on("end", () => resolve(Buffer.concat(chunks)));
          (file as any).on("error", reject);
        });
      } else {
        throw new Error("Unsupported file type for upload");
      }

      const contentType = options.contentType || "application/octet-stream";
      const dataUri = bufferToDataUri(buffer, contentType);

      // Determine resource type from content type
      let resourceType: "image" | "raw" | "video" = "raw";
      if (contentType.startsWith("image/")) resourceType = "image";
      else if (contentType.startsWith("video/")) resourceType = "video";

      const uploadOptions: Record<string, unknown> = {
        folder: options.folder || "uploads",
        public_id: options.filename || filename.replace(/\.[^/.]+$/, ""),
        resource_type: resourceType,
        access_mode: options.access === "private" ? "authenticated" : "public",
        tags: options.metadata ? Object.values(options.metadata) : undefined,
      };

      const response = await cloudinary.v2.uploader.upload(dataUri, uploadOptions);

      return {
        success: true,
        url: response.secure_url,
        key: response.public_id,
        size: response.bytes,
        contentType: contentType,
        metadata: {
          assetId: response.asset_id,
          format: response.format,
          width: response.width,
          height: response.height,
          resourceType: response.resource_type,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Cloudinary upload failed",
        code: "CLOUDINARY_UPLOAD_ERROR",
      };
    }
  }

  async delete(key: string, _options: DeleteOptions = {}): Promise<DeleteResult> {
    try {
      configureCloudinary();
      await cloudinary.v2.uploader.destroy(key);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Cloudinary delete failed",
      };
    }
  }

  async getUrl(key: string, options: GetUrlOptions = {}): Promise<string> {
    configureCloudinary();

    if (options.expiresIn) {
      return this.getSignedUrl(key, options.expiresIn);
    }

    const urlOptions: Record<string, unknown> = {
      secure: true,
    };

    if (options.download) {
      urlOptions.flags = "attachment";
      if (options.downloadFilename) {
        urlOptions.flags = `attachment:${options.downloadFilename}`;
      }
    }

    return cloudinary.v2.url(key, urlOptions);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    configureCloudinary();

    const timestamp = Math.floor(Date.now() / 1000) + expiresIn;

    return cloudinary.v2.url(key, {
      secure: true,
      sign_url: true,
      type: "authenticated",
      expires_at: timestamp,
    });
  }

  async exists(key: string): Promise<ExistsResult> {
    try {
      configureCloudinary();
      const result = await cloudinary.v2.api.resource(key);
      return {
        exists: true,
        size: result.bytes,
        lastModified: new Date(result.created_at),
      };
    } catch {
      return { exists: false };
    }
  }
}

export const cloudinaryStorageProvider = new CloudinaryStorageProvider();
