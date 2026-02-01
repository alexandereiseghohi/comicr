/**
 * Local Storage Provider
 * @description Saves files to public/uploads/ for development
 */

import { access, constants, mkdir, stat, unlink, writeFile } from "fs/promises";
import { extname, join } from "path";
import type {
  DeleteOptions,
  DeleteResult,
  ExistsResult,
  GetUrlOptions,
  StorageProvider,
  UploadOptions,
  UploadResponse,
} from "./types";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const PUBLIC_URL_PREFIX = "/uploads";

/**
 * Ensure upload directory exists
 */
async function ensureDir(dir: string): Promise<void> {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Generate a unique filename
 */
function generateFilename(originalName: string, customName?: string): string {
  const ext = extname(originalName);
  const baseName = customName || originalName.replace(ext, "");
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${baseName}-${timestamp}-${random}${ext}`;
}

/**
 * Local Storage Provider Implementation
 * Stores files in public/uploads/ directory
 */
export class LocalStorageProvider implements StorageProvider {
  readonly name = "local" as const;

  async upload(
    file: Buffer | Blob | ReadableStream,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    try {
      const folder = options.folder || "";
      const targetDir = join(UPLOAD_DIR, folder);
      await ensureDir(targetDir);

      const finalFilename = generateFilename(filename, options.filename);
      const filePath = join(targetDir, finalFilename);

      // Convert Blob to Buffer if needed
      let buffer: Buffer;
      if (file instanceof Buffer) {
        buffer = file;
      } else if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        // ReadableStream
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

      await writeFile(filePath, buffer);

      const key = folder ? `${folder}/${finalFilename}` : finalFilename;
      const url = `${PUBLIC_URL_PREFIX}/${key}`;

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
        error: error instanceof Error ? error.message : "Upload failed",
        code: "UPLOAD_ERROR",
      };
    }
  }

  async delete(key: string, _options: DeleteOptions = {}): Promise<DeleteResult> {
    try {
      const filePath = join(UPLOAD_DIR, key);
      await unlink(filePath);
      return { success: true };
    } catch (error) {
      const errCode = (error as NodeJS.ErrnoException).code;
      if (errCode === "ENOENT") {
        return { success: true }; // File already doesn't exist
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }

  async getUrl(key: string, _options: GetUrlOptions = {}): Promise<string> {
    return `${PUBLIC_URL_PREFIX}/${key}`;
  }

  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    // Local storage doesn't support signed URLs, return public URL
    return this.getUrl(key);
  }

  async exists(key: string): Promise<ExistsResult> {
    try {
      const filePath = join(UPLOAD_DIR, key);
      await access(filePath, constants.F_OK);
      const stats = await stat(filePath);
      return {
        exists: true,
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch {
      return { exists: false };
    }
  }
}

export const localStorageProvider = new LocalStorageProvider();
