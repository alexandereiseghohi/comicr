/**
 * E2E Authentication Helpers
 * Provides reusable sign-in functionality for Playwright tests
 */
import { expect, type Page } from "@playwright/test";

// Test credentials (matches global-setup.ts)
const TEST_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@comicwise.test";
const TEST_ADMIN_PASS = process.env.E2E_ADMIN_PASS ?? "TestAdmin123!";

/**
 * Sign in as test admin user
 */
export async function signInAsAdmin(page: Page): Promise<void> {
  await page.goto("/sign-in");
  const emailInput = page.locator('input[name="email"], input[type="email"]');
  await expect(emailInput).toBeVisible();
  await emailInput.fill(TEST_ADMIN_EMAIL);
  const passwordInput = page.locator('input[name="password"], input[type="password"]');
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill(TEST_ADMIN_PASS);
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  await page.waitForURL((url) => !url.pathname.includes("/sign-in"), { timeout: 10000 });
}

/**
 * Sign in with custom credentials
 */
export async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/sign-in");
  const emailInput = page.locator('input[name="email"], input[type="email"]');
  await expect(emailInput).toBeVisible();
  await emailInput.fill(email);
  const passwordInput = page.locator('input[name="password"], input[type="password"]');
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill(password);
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  await page.waitForURL((url) => !url.pathname.includes("/sign-in"), { timeout: 10000 });
}

/**
 * Check if currently signed in
 */
export async function isSignedIn(page: Page): Promise<boolean> {
  // Look for common indicators of being signed in
  const signOutButton = page.locator('button:has-text("Sign Out"), button:has-text("Logout")');
  const profileLink = page.locator('a[href*="/profile"]');
  const userAvatar = page.locator('[data-testid="user-avatar"], [aria-label*="user"]');

  return (
    (await signOutButton.isVisible().catch(() => false)) ||
    (await profileLink.isVisible().catch(() => false)) ||
    (await userAvatar.isVisible().catch(() => false))
  );
}

/**
 * Sign out if currently signed in
 */
export async function signOut(page: Page): Promise<void> {
  const signOutButton = page.locator('button:has-text("Sign Out"), button:has-text("Logout")');

  if (await signOutButton.isVisible().catch(() => false)) {
    await signOutButton.click();
    await page.waitForURL((url) => url.pathname.includes("/sign-in"), {
      timeout: 5000,
    });
  }
}
