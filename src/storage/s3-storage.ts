import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

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

/**
 * Get S3 client with lazy initialization
 */
function getS3Client(): S3Client {
  const env = getEnv();
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
}

/**
 * Generate a unique S3 key
 */
function generateKey(filename: string, folder?: string, customName?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split(".").pop() || "";
  const baseName = customName || filename.replace(`.${ext}`, "");
  const key = `${baseName}-${timestamp}-${random}.${ext}`;
  return folder ? `${folder}/${key}` : key;
}

/**
 * S3 Storage Provider Implementation
 */
export class S3StorageProvider implements StorageProvider {
  readonly name = "s3" as const;
  private client: null | S3Client = null;
  private bucket: string = "";

  private getClient(): S3Client {
    if (!this.client) {
      this.client = getS3Client();
      this.bucket = getEnv().AWS_S3_BUCKET || "";
    }
    return this.client;
  }

  async upload(
    file: Blob | Buffer | ReadableStream,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    try {
      const client = this.getClient();
      const key = generateKey(filename, options.folder, options.filename);

      // Convert to Buffer
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

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: options.contentType,
        ACL: options.access === "private" ? "private" : "public-read",
        Metadata: options.metadata,
      });

      await client.send(command);

      const url = `https://${this.bucket}.s3.${getEnv().AWS_REGION}.amazonaws.com/${key}`;

      return {
        success: true,
        url,
        key,
        size: buffer.length,
        contentType: options.contentType || "application/octet-stream",
        metadata: options.metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "S3 upload failed",
        code: "S3_UPLOAD_ERROR",
      };
    }
  }

  async delete(key: string, _options: DeleteOptions = {}): Promise<DeleteResult> {
    try {
      const client = this.getClient();
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await client.send(command);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "S3 delete failed",
      };
    }
  }

  async getUrl(key: string, options: GetUrlOptions = {}): Promise<string> {
    if (options.expiresIn) {
      return this.getSignedUrl(key, options.expiresIn);
    }
    return `https://${this.bucket}.s3.${getEnv().AWS_REGION}.amazonaws.com/${key}`;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const client = this.getClient();
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(client, command, { expiresIn });
  }

  async exists(key: string): Promise<ExistsResult> {
    try {
      const client = this.getClient();
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await client.send(command);
      return {
        exists: true,
        size: response.ContentLength,
        lastModified: response.LastModified,
      };
    } catch (error) {
      const err = error as { name?: string };
      if (err.name === "NotFound") {
        return { exists: false };
      }
      throw error;
    }
  }
}

export const s3StorageProvider = new S3StorageProvider();
function getSignedUrl(client: S3Client, command: GetObjectCommand, arg2: { expiresIn: number }): Promise<string> {
  return getSignedUrlOrig(client, command, arg2);
}

// Alias to avoid shadowing the imported getSignedUrl
const getSignedUrlOrig = getSignedUrl as typeof getSignedUrl;
