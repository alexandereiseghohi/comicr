// Types for image helper logic (shared between server and client)

export interface DownloadImageOptions {
  destDir: string;
  fallback?: string;
  filename: string;
  maxRetries?: number;
  skipCache?: boolean;
  url: string;
}

export interface BatchDownloadItem extends DownloadImageOptions {}

export interface DownloadResult {
  cached: boolean;
  error?: string;
  path: string;
  success: boolean;
}

export type ProgressCallback = (completed: number, total: number, filename: string) => void;
