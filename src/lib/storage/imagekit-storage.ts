/**
 * ImageKit Storage Provider
 * @description ImageKit CDN storage implementation
 */

import { getEnv } from "@/lib/env";
import ImageKit from "imagekit";
import type {
  DeleteOptions,
  DeleteResult,
  ExistsResult,
  GetUrlOptions,
  StorageProvider,
  UploadOptions,
  UploadResponse,
} from "./types";

/**
 * Get ImageKit client with lazy initialization
 */
function getImageKitClient(): ImageKit {
  const env = getEnv();
  return new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT || "",
  });
}

/**
 * ImageKit Storage Provider Implementation
 */
export class ImageKitStorageProvider implements StorageProvider {
  readonly name = "imagekit" as const;
  private client: ImageKit | null = null;

  private getClient(): ImageKit {
    if (!this.client) {
      this.client = getImageKitClient();
    }
    return this.client;
  }

  async upload(
    file: Buffer | Blob | ReadableStream,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    try {
      const client = this.getClient();

      // Convert to base64 for ImageKit
      let buffer: Buffer;
      if (file instanceof Buffer) {
        buffer = file;
      } else if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        const chunks: Uint8Array[] = [];
        const stream = file as ReadableStream<Uint8Array>;
        const reader = stream.getReader();
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          if (value) chunks.push(value);
          done = streamDone;
        }
        buffer = Buffer.concat(chunks);
      }

      const response = await client.upload({
        file: buffer.toString("base64"),
        fileName: options.filename || filename,
        folder: options.folder || "/uploads",
        useUniqueFileName: true,
        tags: options.metadata ? Object.values(options.metadata) : undefined,
      });

      return {
        success: true,
        url: response.url,
        key: response.fileId,
        size: response.size,
        contentType: options.contentType || "application/octet-stream",
        metadata: {
          fileId: response.fileId,
          filePath: response.filePath,
          thumbnailUrl: response.thumbnailUrl,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "ImageKit upload failed",
        code: "IMAGEKIT_UPLOAD_ERROR",
      };
    }
  }

  async delete(key: string, _options: DeleteOptions = {}): Promise<DeleteResult> {
    try {
      const client = this.getClient();
      await client.deleteFile(key);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "ImageKit delete failed",
      };
    }
  }

  async getUrl(key: string, options: GetUrlOptions = {}): Promise<string> {
    const env = getEnv();
    const baseUrl = env.IMAGEKIT_URL_ENDPOINT || "";

    if (options.expiresIn) {
      return this.getSignedUrl(key, options.expiresIn);
    }

    // Assuming key is the file path
    return `${baseUrl}/${key}`;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const client = this.getClient();
    const env = getEnv();

    // ImageKit uses authentication parameters for signed URLs
    const authParams = client.getAuthenticationParameters();
    const baseUrl = env.IMAGEKIT_URL_ENDPOINT || "";

    // For private images, append auth token
    return `${baseUrl}/${key}?token=${authParams.token}&expire=${
      Math.floor(Date.now() / 1000) + expiresIn
    }&signature=${authParams.signature}`;
  }

  async exists(key: string): Promise<ExistsResult> {
    try {
      const client = this.getClient();
      const file = await client.getFileDetails(key);
      return {
        exists: true,
        size: file.size,
        lastModified: new Date(file.updatedAt),
      };
    } catch {
      return { exists: false };
    }
  }
}

export const imageKitStorageProvider = new ImageKitStorageProvider();
