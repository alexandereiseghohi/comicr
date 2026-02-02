import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { DATABASE_URL } from "@/lib/env";

import * as schema from "./schema";

/**
 * Create postgres connection client
 * Uses connection pooling for better performance
 */
const client = postgres(DATABASE_URL, {
  prepare: false, // Disable prepared statements for better compatibility
});

/**
 * Initialize Drizzle ORM instance with schema
 * Provides type-safe database operations
 */
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export type Database = typeof db;

// Export drizzle utilities for advanced queries
export { and, eq, inArray, not, or, sql } from "drizzle-orm";
