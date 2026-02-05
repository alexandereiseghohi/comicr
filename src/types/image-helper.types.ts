// Types for image helper logic (shared between server and client)

export interface DownloadImageOptions {
  url: string;
  destDir: string;
  filename: string;
  fallback?: string;
  maxRetries?: number;
  skipCache?: boolean;
}

export interface BatchDownloadItem extends DownloadImageOptions {}

export interface DownloadResult {
  success: boolean;
  path: string;
  cached: boolean;
  error?: string;
}

export type ProgressCallback = (completed: number, total: number, filename: string) => void;
