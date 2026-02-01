/**
 * @file type-seeder.ts
 * @description Seeds comic types from JSON files with validation
 */

import { seedTableBatched } from "@/lib/seed-helpers";
import { TypeSeedSchema, type TypeSeed } from "@/lib/validations/seed";
import { type } from "../../schema";

export interface TypeSeederOptions {
  /** Array of types to seed */
  types: unknown[];
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
}

export interface TypeSeederResult {
  success: boolean;
  seeded: number;
  skipped: number;
  errors: Array<{ type: unknown; error: string }>;
}

/**
 * Seeds comic types from provided data with validation
 */
export async function seedTypes(options: TypeSeederOptions): Promise<TypeSeederResult> {
  const { types: rawTypes, dryRun = false, onProgress } = options;
  const errors: Array<{ type: unknown; error: string }> = [];
  const validTypes: TypeSeed[] = [];

  // Validate all types
  for (const rawType of rawTypes) {
    const parsed = TypeSeedSchema.safeParse(rawType);
    if (!parsed.success) {
      errors.push({
        type: rawType,
        error: parsed.error.message,
      });
      continue;
    }
    validTypes.push(parsed.data);
  }

  if (validTypes.length === 0) {
    return {
      success: errors.length === 0,
      seeded: 0,
      skipped: rawTypes.length,
      errors,
    };
  }

  // Report progress before seeding
  onProgress?.(0, validTypes.length);

  // Seed to database
  const result = await seedTableBatched({
    table: type,
    items: validTypes.map((t) => ({
      name: t.name,
      description: t.description || null,
      isActive: t.isActive ?? true,
    })),
    conflictKeys: [type.name],
    updateFields: [
      { name: "description", value: undefined },
      { name: "isActive", value: undefined },
    ],
    dryRun,
  });

  // Report completion
  onProgress?.(validTypes.length, validTypes.length);

  return {
    success: true,
    seeded: result.inserted,
    skipped: errors.length,
    errors,
  };
}

export default seedTypes;
