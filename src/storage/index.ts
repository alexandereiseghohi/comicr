import { getEnv } from "@/lib/env";

import { CloudinaryStorageProvider } from "./cloudinary-storage";
import { ImageKitStorageProvider } from "./imagekit-storage";
import { LocalStorageProvider } from "./local-storage";
import { S3StorageProvider } from "./s3-storage";
import { type StorageProvider, type StorageProviderType } from "./types";

// Export types
export * from "./types";

// Provider instances (lazy loaded)
let providerInstances: Map<StorageProviderType, StorageProvider> | null = null;

/**
 * Get or create provider instances
 */
function getProviderInstances(): Map<StorageProviderType, StorageProvider> {
  if (!providerInstances) {
    providerInstances = new Map<StorageProviderType, StorageProvider>();
    providerInstances.set("local", new LocalStorageProvider());
    providerInstances.set("s3", new S3StorageProvider());
    providerInstances.set("imagekit", new ImageKitStorageProvider());
    providerInstances.set("cloudinary", new CloudinaryStorageProvider());
  }
  return providerInstances;
}

/**
 * Get the current storage provider based on UPLOAD_PROVIDER env var
 * @returns StorageProvider instance
 */
export function getStorageProvider(): StorageProvider {
  const providerName = (process.env.UPLOAD_PROVIDER as StorageProviderType) || "local";
  const instances = getProviderInstances();
  const provider = instances.get(providerName);

  if (!provider) {
    console.warn(`Unknown storage provider: ${providerName}, falling back to local`);
    return instances.get("local")!;
  }

  return provider;
}

/**
 * Get a specific storage provider by name
 * @param name - Provider name
 * @returns StorageProvider instance
 */
export function getStorageProviderByName(name: StorageProviderType): StorageProvider {
  const instances = getProviderInstances();
  const provider = instances.get(name);

  if (!provider) {
    throw new Error(`Unknown storage provider: ${name}`);
  }

  return provider;
}

/**
 * Check if a storage provider is available (has required credentials)
 */
export function isProviderAvailable(name: StorageProviderType): boolean {
  try {
    const env = getEnv();

    switch (name) {
      case "local":
        return true; // Always available
      case "s3":
        return !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET);
      case "imagekit":
        return !!(env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT);
      case "cloudinary":
        return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Get all available storage providers
 */
export function getAvailableProviders(): StorageProviderType[] {
  const allProviders: StorageProviderType[] = ["local", "s3", "imagekit", "cloudinary"];
  return allProviders.filter(isProviderAvailable);
}

// Default export: current provider
export default getStorageProvider;
