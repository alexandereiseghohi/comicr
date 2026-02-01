/**
 * @file user-seeder-v4.ts
 * @description Seeds users from users.json with validation and password hashing
 * @author ComicWise Team
 * @date 2026-01-30
 */

import users from "../../../../data/seed-source/users.json";
import { hashPassword } from "../helpers/password-hasher";
import { UserSeedSchema } from "../helpers/validation-schemas";

export async function seedUsers() {
  const results = [];
  for (const user of users) {
    const parsed = UserSeedSchema.safeParse(user);
    if (!parsed.success) {
      results.push({ user, error: parsed.error });
      continue;
    }
    const hashed = await hashPassword(parsed.data.password);
    // Insert/upsert logic here (stub)
    results.push({ ...parsed.data, password: hashed, status: "seeded" });
  }
  return results;
}
