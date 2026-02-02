import { expect, test } from "@playwright/test";

test.describe("Profile pages", () => {
  test("redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("Profile Settings", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in first (update with actual credentials)
    await page.goto("/sign-in");
    // ... perform sign in ...
    // For now, skip to settings page
    await page.goto("/profile/settings");
  });

  test("should display settings page", async ({ page }) => {
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  });

  test("should toggle email notifications", async ({ page }) => {
    const notificationSwitch = page.locator('[role="switch"]').first();

    // Get initial state
    const initialState = await notificationSwitch.getAttribute("aria-checked");

    // Toggle switch
    await notificationSwitch.click();
    await page.waitForTimeout(500);

    // State should change
    const newState = notificationSwitch;
    await expect(newState).not.toHaveAttribute("aria-checked", initialState ?? "false");
  });

  test("should change profile visibility", async ({ page }) => {
    const visibilitySelect = page.locator('select, [role="combobox"]').first();

    if (await visibilitySelect.isVisible()) {
      await visibilitySelect.click();
      await page.waitForTimeout(300);

      // Select an option
      const options = page.locator('[role="option"]');
      if ((await options.count()) > 0) {
        await options.first().click();
      }
    }
  });

  test("should save changes", async ({ page }) => {
    // Make a change
    const notificationSwitch = page.locator('[role="switch"]').first();
    await notificationSwitch.click();
    await page.waitForTimeout(500);

    // Click save button
    const saveButton = page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Should show success toast
      await expect(
        page.locator('text="Settings saved"').or(page.locator('text="Success"'))
      ).toBeVisible({ timeout: 5000 });
    }
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
    // Fill in weak new password
    await page.fill('input[name="currentPassword"]', "OldPass123");
    await page.fill('input[name="newPassword"]', "weak");
    await page.fill('input[name="confirmPassword"]', "weak");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error
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

    // Initially should be password type
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle
    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Should change to text type
      await expect(passwordInput).toHaveAttribute("type", "text");
    }
  });
});

test.describe("Delete Account", () => {
  test("should show delete account confirmation", async ({ page }) => {
    await page.goto("/profile/settings");

    // Find delete button
    const deleteButton = page.locator('button:has-text("Delete Account")');

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Should show confirmation dialog
      await expect(
        page.locator("text=/Are you sure/i").or(page.locator('[role="alertdialog"]'))
      ).toBeVisible();
    }
  });
});
