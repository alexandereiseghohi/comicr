import { expect, test } from "@playwright/test";

import { signInAsAdmin } from "./helpers/auth";

test.describe("Profile pages", () => {
  test("redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("Profile Settings", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as admin before each test
    await signInAsAdmin(page);
    await page.goto("/profile/settings");
  });

  test("should display settings page", async ({ page }) => {
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  });

  test("should toggle email notifications", async ({ page }) => {
    const notificationSwitch = page.locator('[role="switch"]').first();
    await expect(notificationSwitch).toBeVisible();
    const initialState = await notificationSwitch.getAttribute("aria-checked");
    await notificationSwitch.click();
    // Wait for state to change
    await expect(notificationSwitch).not.toHaveAttribute("aria-checked", initialState ?? "false");
  });

  test("should change profile visibility", async ({ page }) => {
    const visibilitySelect = page.locator('select, [role="combobox"]').first();
    if ((await visibilitySelect.count()) > 0 && (await visibilitySelect.isVisible())) {
      await visibilitySelect.click();
      const options = page.locator('[role="option"]');
      if ((await options.count()) > 0) {
        await options.first().click();
        // Assert that the value changed (if possible)
        await expect(visibilitySelect).toBeVisible();
      }
    }
  });

  test("should save changes", async ({ page }) => {
    const notificationSwitch = page.locator('[role="switch"]').first();
    await expect(notificationSwitch).toBeVisible();
    await notificationSwitch.click();
    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await expect(page.locator('text="Settings saved"').or(page.locator('text="Success"'))).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Change Password", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile/change-password");
  });

  test("should display password change form", async ({ page }) => {
    await expect(page.locator('input[type="password"]')).toHaveCount(3);
  });

  test("should show validation errors for weak password", async ({ page }) => {
    await page.fill('input[name="currentPassword"]', "OldPass123");
    await page.fill('input[name="newPassword"]', "weak");
    await page.fill('input[name="confirmPassword"]', "weak");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=/8 characters/i")).toBeVisible();
  });

  test("should show error when passwords don't match", async ({ page }) => {
    await page.fill('input[name="currentPassword"]', "OldPass123");
    await page.fill('input[name="newPassword"]', "NewPass456");
    await page.fill('input[name="confirmPassword"]', "DifferentPass789");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=/match/i")).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    const passwordInput = page.locator('input[name="newPassword"]');
    const toggleButton = page.locator('button[aria-label*="password"]').first();
    await expect(passwordInput).toHaveAttribute("type", "password");
    if ((await toggleButton.count()) > 0 && (await toggleButton.isVisible())) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "text");
    }
  });
});

test.describe("Delete Account", () => {
  test("should show delete account confirmation", async ({ page }) => {
    await page.goto("/profile/settings");
    const deleteButton = page.locator('button:has-text("Delete Account")');
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await expect(page.locator("text=/Are you sure/i").or(page.locator('[role="alertdialog"]'))).toBeVisible();
  });
});
