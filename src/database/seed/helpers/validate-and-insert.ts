/**
 * @file validate-and-insert.ts
 * @description Validates and upserts entities with Zod and error handling
 * @author ComicWise Team
 * @date 2026-01-30
 */

import { ZodSchema } from "zod";

export async function validateAndInsert<T>(
  schema: ZodSchema<T>,
  data: unknown,
  upsertFn: (item: T) => Promise<unknown>
) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error };
  }
  try {
    const result = await upsertFn(parsed.data);
    return { result };
  } catch (error) {
    return { error };
  }
}
