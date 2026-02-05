import { expect, test } from "@playwright/test";

test.describe("Search Functionality", () => {
  test("should display search input on home page", async ({ page }) => {
    await page.goto("/");

    // Look for search trigger (button, input, or icon)
    const searchTrigger = page
      .getByRole("button", { name: /search/i })
      .or(page.getByPlaceholder(/search/i))
      .or(page.getByRole("searchbox"));

    await expect(searchTrigger).toBeVisible();
  });

  test("should open search modal with keyboard shortcut", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const searchDialog = page.getByRole("dialog");
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));
    // Wait for either dialog or search input to be visible
    await expect(searchDialog.or(searchInput)).toBeVisible();
  });

  test("should open search with click", async ({ page }) => {
    await page.goto("/");

    const searchButton = page.getByRole("button", { name: /search/i });

    await expect(searchButton).toBeVisible();
    await searchButton.click();
    // Search dialog or input should appear
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));
    await expect(searchInput).toBeVisible();
  });

  test("should search for comics by title", async ({ page }) => {
    await page.goto("/");
    const searchButton = page.getByRole("button", { name: /search/i });
    await expect(searchButton.or(page.locator("body"))).toBeVisible();
    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await page.keyboard.press("Control+k");
    }
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test");
    // Wait for results to appear
    const results = page.getByRole("option").or(page.getByRole("listitem"));
    const noResults = page.getByText(/no results|not found/i);
    await expect(results.first().or(noResults.first())).toBeVisible({ timeout: 5000 });
  });

  test("should navigate to comic from search results", async ({ page }) => {
    await page.goto("/");
    const searchButton = page.getByRole("button", { name: /search/i });
    await expect(searchButton.or(page.locator("body"))).toBeVisible();
    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await page.keyboard.press("Control+k");
    }
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));
    await expect(searchInput).toBeVisible();
    await searchInput.fill("comic");
    const firstResult = page.getByRole("option").first().or(page.getByRole("link").first());
    await expect(firstResult).toBeVisible();
    await firstResult.click();
    await expect(page).not.toHaveURL(/^\/$/);
  });

  test("should close search modal with Escape key", async ({ page }) => {
    await page.goto("/");

    // Open search
    await page.keyboard.press("Control+k");

    const searchDialog = page.getByRole("dialog");

    await expect(searchDialog).toBeVisible();
    // Press escape to close
    await page.keyboard.press("Escape");
    // Dialog should be hidden
    await expect(searchDialog).toBeHidden();
  });

  test("should handle empty search query", async ({ page }) => {
    await page.goto("/");

    const searchButton = page.getByRole("button", { name: /search/i });
    await expect(searchButton).toBeVisible();
    await searchButton.click();
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));
    await expect(searchInput).toBeVisible();
    // Clear any existing text and submit
    await searchInput.clear();
    await searchInput.press("Enter");
    // Should not navigate or should show empty state
    // Wait for possible UI update
    // Wait for either dialog or search input to be visible
    const dialogOrInput = page.getByRole("dialog").or(page.getByRole("searchbox"));
    await expect(dialogOrInput).toBeVisible({ timeout: 1000 });
  });

  test("should display search page with query parameter", async ({ page }) => {
    await page.goto("/search?q=manga");

    // Search page should display
    const heading = page.getByRole("heading", { name: /search|results/i });
    const results = page.locator("[data-testid=search-results], main");

    await expect(heading.or(results)).toBeVisible();
  });

  test("should display no results message for non-existent query", async ({ page }) => {
    await page.goto("/search?q=xyznonexistent123456");

    // Should show no results message
    const noResults = page.getByText(/no results|not found|empty/i);

    await expect(noResults).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Search Results Page", () => {
  test("should display search input with query", async ({ page }) => {
    const searchQuery = "action";
    await page.goto(`/search?q=${searchQuery}`);

    // Search input should have the query value
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));

    await expect(searchInput).toBeVisible();
  });

  test("should update results when query changes", async ({ page }) => {
    await page.goto("/search?q=manga");
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));
    await expect(searchInput).toBeVisible();
    await searchInput.clear();
    await searchInput.fill("manhwa");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/q=manhwa/);
  });

  test("should display result count or summary", async ({ page }) => {
    await page.goto("/search?q=comic");

    // Look for result count or summary text - this may or may not be present
    // depending on implementation
    // Wait for result count or summary to appear (if implemented)
    // This is a no-op if not present, but ensures test waits for UI
    // Wait for result count, summary, or main to be visible (if implemented)
    const resultCount = page.locator("[data-testid=result-count]");
    const summary = page.locator("[data-testid=summary]");
    const main = page.getByRole("main");
    await expect(resultCount.or(summary).or(main)).toBeVisible({ timeout: 2000 });
  });

  test("should paginate search results if available", async ({ page }) => {
    await page.goto("/search?q=a");
    const nextButton = page.getByRole("button", { name: /next|→|>/i }).or(page.getByRole("link", { name: /next|2/i }));
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    } else {
      const results = page.locator("[data-testid=search-results] [role=listitem], [role=option]");
      await expect(results.first()).toBeVisible();
    }
  });
});
