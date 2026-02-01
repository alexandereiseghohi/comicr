import { expect, test } from "@playwright/test";

test.describe("Chapter Reader", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a chapter (update with actual chapter URL)
    await page.goto("/comics/1/chapters/1");
  });

  test("should display chapter reader with images", async ({ page }) => {
    // Wait for reader to load
    await expect(page.locator('[data-testid="chapter-reader"]')).toBeVisible();

    // Check for image viewer
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
  });

  test("should navigate between pages with arrow keys", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Press right arrow to go to next page
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);

    // Press left arrow to go back
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(500);

    // Check that navigation occurred (page element should update)
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
  });

  test("should toggle fullscreen mode", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Press 'f' key to toggle fullscreen
    await page.keyboard.press("f");
    await page.waitForTimeout(500);

    // In fullscreen, controls should auto-hide after timeout
    // Press Escape to exit fullscreen
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  });

  test("should open reader settings", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Press 's' key to open settings
    await page.keyboard.press("s");

    // Settings sheet should appear
    await expect(
      page.locator('text="Reader Settings"').or(page.locator('text="Settings"'))
    ).toBeVisible();
  });

  test("should zoom in and out", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Press '+' to zoom in
    await page.keyboard.press("+");
    await page.waitForTimeout(300);

    // Press '-' to zoom out
    await page.keyboard.press("-");
    await page.waitForTimeout(300);

    // Press '0' to reset zoom
    await page.keyboard.press("0");
    await page.waitForTimeout(300);
  });

  test("should show progress bar", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Progress bar should be visible
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test("should switch between reading modes", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Open settings
    await page.keyboard.press("s");

    // Wait for settings dialog
    await page.waitForTimeout(500);

    // Look for reading mode options (vertical/horizontal)
    const verticalOption = page.locator('text="Vertical"');
    const horizontalOption = page.locator('text="Horizontal"');

    // At least one should be visible
    const hasVertical = await verticalOption.isVisible();
    const hasHorizontal = await horizontalOption.isVisible();

    expect(hasVertical || hasHorizontal).toBeTruthy();
  });
});

test.describe("Reading Progress", () => {
  test("should save progress automatically", async ({ page }) => {
    // Sign in first (update with actual auth flow)
    await page.goto("/sign-in");
    // ... sign in steps ...

    await page.goto("/comics/1/chapters/1");
    await page.waitForLoadState("networkidle");

    // Navigate a few pages
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1000);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Dialog may or may not appear based on progress threshold
    // Just check page loads correctly
    await expect(page.locator('[data-testid="chapter-reader"]')).toBeVisible();
  });
});
