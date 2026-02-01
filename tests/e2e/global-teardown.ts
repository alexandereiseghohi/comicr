/**
 * Playwright Global Teardown
 * Cleanup test data after E2E tests complete
 */
import postgres from "postgres";

const TEST_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@comicwise.test";

export default async function globalTeardown() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log("⚠️  DATABASE_URL not set - skipping teardown");
    return;
  }

  // Optionally clean up test data
  // Set E2E_CLEANUP=true to remove test admin after tests
  if (process.env.E2E_CLEANUP !== "true") {
    console.log("ℹ️  E2E Global Teardown: Keeping test data (set E2E_CLEANUP=true to remove)");
    return;
  }

  console.log("🧹 E2E Global Teardown: Cleaning up test data...");

  const sql = postgres(databaseUrl, { prepare: false });

  try {
    // Delete test admin user (cascades to related data)
    const result = await sql`
      DELETE FROM "user" WHERE email = ${TEST_ADMIN_EMAIL}
      RETURNING id
    `;

    if (result.length > 0) {
      console.log(`✅ Removed test admin: ${TEST_ADMIN_EMAIL}`);
    } else {
      console.log(`ℹ️  Test admin not found: ${TEST_ADMIN_EMAIL}`);
    }

    // Clean up any test-created data (entities created during tests)
    await sql`DELETE FROM "author" WHERE name LIKE 'E2E Test%'`;
    await sql`DELETE FROM "artist" WHERE name LIKE 'E2E Test%'`;
    await sql`DELETE FROM "genre" WHERE name LIKE 'E2E Test%'`;
    await sql`DELETE FROM "type" WHERE name LIKE 'E2E Test%'`;

    console.log("🎉 E2E Global Teardown complete!");
  } catch (error) {
    console.error("❌ E2E Global Teardown failed:", error);
  } finally {
    await sql.end();
  }
}
