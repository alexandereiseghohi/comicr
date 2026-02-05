import { expect, test } from "@playwright/test";

import { signInAsAdmin } from "./helpers/auth";

test.describe("Comic Rating", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a comic detail page
    await page.goto("/comics/1");
  });

  test("should display average rating", async ({ page }) => {
    // Star rating should be visible
    const stars = page.locator('[data-testid="average-rating"], svg[class*="star"]');
    await expect(stars.first()).toBeVisible({ timeout: 10000 });
  });

  test("should allow authenticated user to rate", async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto("/comics/1");
    const ratingStars = page.locator('[aria-label*="Rate"]').or(page.locator('button:has(svg[class*="star"])'));
    await expect(ratingStars.nth(3)).toBeVisible();
    await ratingStars.nth(3).click();
    const reviewDialog = page.locator('text="Rate This Comic"');
    await expect(reviewDialog).toBeVisible();
    await page.fill("textarea", "Great comic!");
    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await expect(page.locator("text=/Rating.*saved/i")).toBeVisible({ timeout: 5000 });
  });

  test("should update existing rating", async ({ page }) => {
    await page.goto("/comics/1");
    const ratingStars = page.locator('[aria-label*="Rate"]');
    await expect(ratingStars.nth(2)).toBeVisible();
    await ratingStars.nth(2).click();
  });

  test("should remove rating", async ({ page }) => {
    await page.goto("/comics/1");
    const removeButton = page.locator('button[aria-label="Remove rating"]');
    await expect(removeButton).toBeVisible();
    await removeButton.click();
  });
});

test.describe("Comments", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a chapter with comments section
    await page.goto("/comics/1/chapters/1");
  });

  test("should display comments section", async ({ page }) => {
    // Scroll to comments section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // Comments heading should be visible
    await expect(page.locator('h2:has-text("Comments")').or(page.locator('[data-testid="comments"]'))).toBeVisible({
      timeout: 10000,
    });
  });

  test("should post a new comment", async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto("/comics/1/chapters/1");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const commentBox = page.locator('textarea[placeholder*="comment"]').first();
    await expect(commentBox).toBeVisible();
    await commentBox.fill("This is a test comment!");
    const submitButton = page.locator('button:has-text("Post")');
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    await expect(page.locator("text=/Comment.*posted/i")).toBeVisible({ timeout: 5000 });
  });

  test("should reply to a comment", async ({ page }) => {
    await page.goto("/comics/1/chapters/1");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const replyButton = page.locator('button:has-text("Reply")').first();
    await expect(replyButton).toBeVisible();
    await replyButton.click();
    const replyBox = page.locator("textarea").last();
    await expect(replyBox).toBeVisible();
    await replyBox.fill("This is a reply!");
    const submitReply = page.locator('button:has-text("Post Reply")');
    await expect(submitReply).toBeVisible();
    await submitReply.click();
  });

  test("should collapse/expand comment threads", async ({ page }) => {
    await page.goto("/comics/1/chapters/1");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const toggleButton = page.locator('button:has-text("Hide")').or(page.locator('button:has-text("Show")')).first();
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();
    await toggleButton.click();
  });

  test("should delete own comment", async ({ page }) => {
    await page.goto("/comics/1/chapters/1");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const deleteButton = page.locator('button:has-text("Delete")').first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    const confirmButton = page.locator('button:has-text("Delete")').last();
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  });

  test("should sort comments", async ({ page }) => {
    await page.goto("/comics/1/chapters/1");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const newestButton = page.locator('button:has-text("Newest")');
    const oldestButton = page.locator('button:has-text("Oldest")');
    await expect(newestButton).toBeVisible();
    await newestButton.click();
    await expect(oldestButton).toBeVisible();
    await oldestButton.click();
  });
});
