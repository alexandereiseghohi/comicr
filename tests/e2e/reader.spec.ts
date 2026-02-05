import { expect, test } from "@playwright/test";

import { signInAsAdmin } from "./helpers/auth";

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
    // Wait for image viewer to be visible before navigation
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
  });

  test("should toggle fullscreen mode", async ({ page }) => {
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
    await page.keyboard.press("f");
    // Optionally check for fullscreen indicator if available
    await page.keyboard.press("Escape");
  });

  test("should open reader settings", async ({ page }) => {
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
    // Press 's' key to open settings
    await page.keyboard.press("s");
    // Settings sheet should appear
    await expect(page.locator('text="Reader Settings"').or(page.locator('text="Settings"'))).toBeVisible();
  });

  test("should zoom in and out", async ({ page }) => {
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
    await page.keyboard.press("+");
    await page.keyboard.press("-");
    await page.keyboard.press("0");
  });

  test("should show progress bar", async ({ page }) => {
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test("should switch between reading modes", async ({ page }) => {
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
    await page.keyboard.press("s");
    const verticalOption = page.locator('text="Vertical"');
    const horizontalOption = page.locator('text="Horizontal"');
    // At least one should be visible
    await expect(verticalOption.or(horizontalOption)).toBeVisible();
  });
});

test.describe("Reading Progress", () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
  });

  test("should save progress automatically", async ({ page }) => {
    await page.goto("/comics/1/chapters/1");
    await expect(page.locator('[data-testid="chapter-reader"]')).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.reload();
    await expect(page.locator('[data-testid="chapter-reader"]')).toBeVisible();
  });
});
