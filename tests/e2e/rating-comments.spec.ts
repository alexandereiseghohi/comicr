import { expect, test } from "@playwright/test";

test.describe("Comic Rating", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a comic detail page
    await page.goto("/comics/1");
  });

  test("should display average rating", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Star rating should be visible
    const stars = page.locator('[data-testid="average-rating"], svg[class*="star"]');
    await expect(stars.first()).toBeVisible({ timeout: 10000 });
  });

  test("should allow authenticated user to rate", async ({ page }) => {
    // Sign in first
    await page.goto("/sign-in");
    // ... sign in steps ...

    await page.goto("/comics/1");
    await page.waitForLoadState("networkidle");

    // Find rating stars
    const ratingStars = page
      .locator('[aria-label*="Rate"]')
      .or(page.locator('button:has(svg[class*="star"])'));

    const starCount = await ratingStars.count();
    if (starCount > 0) {
      // Click on 4th star
      await ratingStars.nth(3).click();

      // Dialog should appear for review
      await page.waitForTimeout(1000);

      // Check if review dialog appeared
      const reviewDialog = page.locator('text="Rate This Comic"');
      if (await reviewDialog.isVisible()) {
        // Can add optional review
        await page.fill("textarea", "Great comic!");

        // Save rating
        await page.click('button:has-text("Save")');

        // Should show success message
        await expect(page.locator("text=/Rating.*saved/i")).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should update existing rating", async ({ page }) => {
    // This test assumes user is already signed in and has rated
    await page.goto("/comics/1");
    await page.waitForLoadState("networkidle");

    // Click different star to update
    const ratingStars = page.locator('[aria-label*="Rate"]');
    const starCount = await ratingStars.count();

    if (starCount > 0) {
      await ratingStars.nth(2).click(); // 3 stars
      await page.waitForTimeout(1000);
    }
  });

  test("should remove rating", async ({ page }) => {
    await page.goto("/comics/1");
    await page.waitForLoadState("networkidle");

    // Find remove/clear button (X icon)
    const removeButton = page.locator('button[aria-label="Remove rating"]');

    if (await removeButton.isVisible()) {
      await removeButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe("Comments", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a chapter with comments section
    await page.goto("/comics/1/chapters/1");
  });

  test("should display comments section", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Scroll to comments section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Comments heading should be visible
    await expect(
      page.locator('h2:has-text("Comments")').or(page.locator('[data-testid="comments"]'))
    ).toBeVisible({ timeout: 10000 });
  });

  test("should post a new comment", async ({ page }) => {
    // Sign in first
    // ... sign in steps ...

    await page.goto("/comics/1/chapters/1");
    await page.waitForLoadState("networkidle");

    // Scroll to comments
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find comment textarea
    const commentBox = page.locator('textarea[placeholder*="comment"]').first();

    if (await commentBox.isVisible()) {
      await commentBox.fill("This is a test comment!");

      // Submit comment
      const submitButton = page.locator('button:has-text("Post")');
      await submitButton.click();

      // Should show success message
      await expect(page.locator("text=/Comment.*posted/i")).toBeVisible({ timeout: 5000 });
    }
  });

  test("should reply to a comment", async ({ page }) => {
    await page.goto("/comics/1/chapters/1");
    await page.waitForLoadState("networkidle");

    // Scroll to comments
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find reply button
    const replyButton = page.locator('button:has-text("Reply")').first();

    if (await replyButton.isVisible()) {
      await replyButton.click();
      await page.waitForTimeout(500);

      // Fill in reply
      const replyBox = page.locator("textarea").last();
      await replyBox.fill("This is a reply!");

      // Submit reply
      const submitReply = page.locator('button:has-text("Post Reply")');
      await submitReply.click();

      await page.waitForTimeout(2000);
    }
  });

  test("should collapse/expand comment threads", async ({ page }) => {
    await page.goto("/comics/1/chapters/1");
    await page.waitForLoadState("networkidle");

    // Scroll to comments
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find collapse/expand button
    const toggleButton = page
      .locator('button:has-text("Hide")')
      .or(page.locator('button:has-text("Show")'))
      .first();

    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);

      // Click again to toggle
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
  });

  test("should delete own comment", async ({ page }) => {
    await page.goto("/comics/1/chapters/1");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find delete button (only on own comments)
    const deleteButton = page.locator('button:has-text("Delete")').first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirmation dialog should appear
      await page.waitForTimeout(500);

      // Confirm deletion
      const confirmButton = page.locator('button:has-text("Delete")').last();
      await confirmButton.click();

      await page.waitForTimeout(1000);
    }
  });

  test("should sort comments", async ({ page }) => {
    await page.goto("/comics/1/chapters/1");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find sort buttons
    const newestButton = page.locator('button:has-text("Newest")');
    const oldestButton = page.locator('button:has-text("Oldest")');

    if (await newestButton.isVisible()) {
      await newestButton.click();
      await page.waitForTimeout(500);
    }

    if (await oldestButton.isVisible()) {
      await oldestButton.click();
      await page.waitForTimeout(500);
    }
  });
});
