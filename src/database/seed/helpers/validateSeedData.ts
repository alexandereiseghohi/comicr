import { ZodError, ZodSchema } from "zod";

/**
 * Validates an array of seed data using the provided Zod schema.
 * Returns an object with valid items and an array of error details.
 */
export function validateSeedData<T>(
  schema: ZodSchema<T>,
  data: unknown[]
): {
  valid: T[];
  errors: Array<{ item: unknown; error: string }>;
} {
  const valid: T[] = [];
  const errors: Array<{ item: unknown; error: string }> = [];
  for (const item of data) {
    const parsed = schema.safeParse(item);
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      errors.push({
        item,
        error: parsed.error instanceof ZodError ? parsed.error.message : String(parsed.error),
      });
    }
  }
  return { valid, errors };
}
