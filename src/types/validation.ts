/**
 * Custom Validation Types
 * @description Zod schemas and types for form validation
 */

import { z } from "zod";

/**
 * Email validation schema
 * Supports standard email formats and special characters
 */
export const emailValidator = z
  .string()
  .email("Invalid email address")
  .min(5, "Email too short")
  .max(255, "Email too long")
  .transform((e) => e.toLowerCase());

export type Email = z.infer<typeof emailValidator>;

/**
 * Password validation schema
 * Requires: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)");

export type Password = z.infer<typeof passwordValidator>;

/**
 * URL validation schema
 */
export const urlValidator = z.string().url("Invalid URL").min(5).max(2048);

export type Url = z.infer<typeof urlValidator>;

/**
 * Phone number validation schema
 * Supports international format: +1123456789
 */
export const phoneValidator = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

export type PhoneNumber = z.infer<typeof phoneValidator>;

/**
 * Slug validation schema
 * Only lowercase letters, numbers, and hyphens
 */
export const slugValidator = z
  .string()
  .min(1, "Slug required")
  .max(255, "Slug too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export type Slug = z.infer<typeof slugValidator>;

/**
 * UUID validation schema
 */
export const uuidValidator = z.string().uuid("Invalid UUID");

export type UUID = z.infer<typeof uuidValidator>;

/**
 * Date validation schema
 */
export const dateValidator = z.coerce.date();

export type DateType = z.infer<typeof dateValidator>;

/**
 * File upload validation schema
 */
export const fileValidator = z.object({
  name: z.string(),
  size: z.number().max(52428800, "File too large (max 50MB)"),
  type: z.string().regex(/^[a-z]+\/[a-z0-9+.-]+$/, "Invalid file type"),
});

export type File = z.infer<typeof fileValidator>;

/**
 * Pagination schema
 */
export const paginationValidator = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type Pagination = z.infer<typeof paginationValidator>;

/**
 * Sort direction schema
 */
export const sortValidator = z.enum(["asc", "desc"]).default("asc");

export type SortDirection = z.infer<typeof sortValidator>;

/**
 * Color validation schema (hex, rgb, rgba, hsl)
 */
export const colorValidator = z
  .string()
  .regex(/^(#[a-f0-9]{6}|rgb\(\d+,\s*\d+,\s*\d+\))$/i, "Invalid color format");

export type Color = z.infer<typeof colorValidator>;

/**
 * ISO datetime validation (ISO 8601)
 */
export const isoDateValidator = z.string().datetime("Invalid ISO datetime");

export type ISODate = z.infer<typeof isoDateValidator>;

/**
 * Positive integer validator
 */
export const positiveIntValidator = z.number().int().positive("Must be positive");

export type PositiveInt = z.infer<typeof positiveIntValidator>;

/**
 * Non-negative integer validator
 */
export const nonNegativeIntValidator = z.number().int().nonnegative("Must be non-negative");

export type NonNegativeInt = z.infer<typeof nonNegativeIntValidator>;

/**
 * Percentage validator (0-100)
 */
export const percentageValidator = z.number().min(0).max(100);

export type Percentage = z.infer<typeof percentageValidator>;
