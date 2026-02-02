import { seedTableBatched } from "@/lib/seed-helpers";
import { type TypeSeed, TypeSeedSchema } from "@/lib/validations/seed";

import { db } from "../../db";
import { type } from "../../schema";
import { BATCH_SIZE } from "../seed-config";

export interface TypeSeederOptions {
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
  /** Array of types to seed */
  types: unknown[];
}

export interface TypeSeederResult {
  errors: Array<{ error: string; type: unknown }>;
  /** Map of type name (lowercase) to database ID */
  idMap: Map<string, number>;
  seeded: number;
  skipped: number;
  success: boolean;
}

/**
 * Seeds comic types from provided data with validation
 */
export async function seedTypes(options: TypeSeederOptions): Promise<TypeSeederResult> {
  const { types: rawTypes, dryRun = false, onProgress } = options;
  const errors: Array<{ error: string; type: unknown }> = [];
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
      idMap: new Map(),
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
    batchSize: BATCH_SIZE,
    dryRun,
  });

  // Build ID map by querying inserted records
  const idMap = new Map<string, number>();
  if (!dryRun) {
    const seededTypes = await db.query.type.findMany({
      columns: { id: true, name: true },
      where: (table, { inArray }) =>
        inArray(
          table.name,
          validTypes.map((t) => t.name)
        ),
    });
    for (const item of seededTypes) {
      idMap.set(item.name.toLowerCase(), item.id);
    }
  }

  // Report completion
  onProgress?.(validTypes.length, validTypes.length);

  return {
    success: true,
    seeded: result.inserted,
    skipped: errors.length,
    errors,
    idMap,
  };
}

export default seedTypes;
