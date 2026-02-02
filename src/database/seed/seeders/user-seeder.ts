/**
 * @file user-seeder.ts
 * @description Seeds users from JSON files with validation and password hashing
 */

import { downloadAndSaveImage } from "@/lib/image-helper";
import { seedTableBatched } from "@/lib/seed-helpers";
import { type UserSeed, UserSeedSchema } from "@/lib/validations/seed";

import { user } from "../../schema";
import { hashPassword } from "../helpers";
import { AVATARS_IMAGE_DIR, CUSTOM_PASSWORD, PLACEHOLDER_USER } from "../seed-config";

export interface UserSeederOptions {
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
  /** Array of users to seed */
  users: unknown[];
}

export interface UserSeederResult {
  errors: Array<{ error: string; user: unknown }>;
  seeded: number;
  skipped: number;
  success: boolean;
}

/**
 * Seeds users from provided data with validation and password hashing
 */
export async function seedUsers(options: UserSeederOptions): Promise<UserSeederResult> {
  const { users: rawUsers, dryRun = false, onProgress } = options;
  const errors: Array<{ error: string; user: unknown }> = [];
  const validUsers: (UserSeed & { password: string })[] = [];

  // Hash password once for all users
  const passwordHash = await hashPassword(CUSTOM_PASSWORD);

  // Validate all users
  for (const rawUser of rawUsers) {
    const parsed = UserSeedSchema.safeParse(rawUser);
    if (!parsed.success) {
      errors.push({
        user: rawUser,
        error: parsed.error.message,
      });
      continue;
    }
    validUsers.push({
      ...parsed.data,
      password: passwordHash,
    });
  }

  if (validUsers.length === 0) {
    return {
      success: errors.length === 0,
      seeded: 0,
      skipped: rawUsers.length,
      errors,
    };
  }

  // Download images if not dry run
  if (!dryRun) {
    await Promise.all(
      validUsers.map(async (userData) => {
        if (userData.image && userData.image.startsWith("http")) {
          try {
            userData.image = await downloadAndSaveImage({
              url: userData.image,
              destDir: AVATARS_IMAGE_DIR,
              filename: `${userData.id}.jpg`,
              fallback: PLACEHOLDER_USER,
            });
          } catch {
            userData.image = PLACEHOLDER_USER;
          }
        } else if (!userData.image) {
          userData.image = PLACEHOLDER_USER;
        }
      })
    );
  }

  // Report progress before seeding
  onProgress?.(0, validUsers.length);

  // Seed to database
  const result = await seedTableBatched({
    table: user,
    items: validUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image || null,
      role: u.role || "user",
      password: u.password,
      status: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    conflictKeys: [user.id],
    updateFields: [
      { name: "name", value: undefined },
      { name: "email", value: undefined },
      { name: "image", value: undefined },
      { name: "password", value: undefined },
      { name: "role", value: undefined },
    ],
    dryRun,
  });

  // Report completion
  onProgress?.(validUsers.length, validUsers.length);

  // Skipped = total input - inserted - errors (items that were skipped due to conflicts, not errors)
  const actualSkipped = (rawUsers as unknown[]).length - result.inserted - errors.length;

  return {
    success: true,
    seeded: result.inserted,
    skipped: actualSkipped > 0 ? actualSkipped : 0,
    errors,
  };
}

export default seedUsers;
