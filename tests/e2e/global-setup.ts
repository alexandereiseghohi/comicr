/**
 * Playwright Global Setup
 * Seeds test admin user before E2E tests run
 */
import { randomBytes, scryptSync } from "crypto";
import postgres from "postgres";

// Test credentials (matches admin.spec.ts defaults)
const TEST_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@comicwise.test";
const TEST_ADMIN_PASS = process.env.E2E_ADMIN_PASS ?? "TestAdmin123!";
const TEST_ADMIN_NAME = "E2E Test Admin";

/**
 * Hash password using scrypt (matches src/lib/password.ts)
 */
function hashPassword(password: string): string {
  const KEY_LEN = 64;
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LEN);
  return `${salt}:${derived.toString("hex")}`;
}

/**
 * Generate UUID for user ID
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

export default async function globalSetup() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn(
      "⚠️  DATABASE_URL not set - skipping test user seeding. E2E tests may fail if admin user doesn't exist."
    );
    return;
  }

  console.log("🌱 E2E Global Setup: Seeding test admin user...");

  const sql = postgres(databaseUrl, { prepare: false });

  try {
    // Check if test admin already exists
    const existingUser = await sql`
      SELECT id, email FROM "user" WHERE email = ${TEST_ADMIN_EMAIL}
    `;

    if (existingUser.length > 0) {
      console.log(`✅ Test admin already exists: ${TEST_ADMIN_EMAIL}`);

      // Update password in case it changed
      const hashedPassword = hashPassword(TEST_ADMIN_PASS);
      await sql`
        UPDATE "user"
        SET password = ${hashedPassword}, role = 'admin', status = true
        WHERE email = ${TEST_ADMIN_EMAIL}
      `;
      console.log("✅ Updated test admin password and role");
    } else {
      // Create new test admin user
      const userId = generateUUID();
      const hashedPassword = hashPassword(TEST_ADMIN_PASS);
      const now = new Date();

      await sql`
        INSERT INTO "user" (id, name, email, password, role, status, "createdAt", "updatedAt")
        VALUES (
          ${userId},
          ${TEST_ADMIN_NAME},
          ${TEST_ADMIN_EMAIL},
          ${hashedPassword},
          'admin',
          true,
          ${now},
          ${now}
        )
      `;

      console.log(`✅ Created test admin: ${TEST_ADMIN_EMAIL}`);
    }

    console.log("🎉 E2E Global Setup complete!");
  } catch (error) {
    console.error("❌ E2E Global Setup failed:", error);
    // Don't throw - allow tests to run and fail naturally if user doesn't exist
  } finally {
    await sql.end();
  }
}
