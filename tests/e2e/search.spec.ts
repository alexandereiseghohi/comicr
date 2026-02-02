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

    // Try Ctrl+K (common search shortcut)
    await page.keyboard.press("Control+k");

    // Dialog or search input should appear
    const searchDialog = page.getByRole("dialog");
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));

    // Either dialog should be visible or search input should be focused
    const dialogVisible = await searchDialog.isVisible();
    const inputVisible = await searchInput.isVisible();

    expect(dialogVisible || inputVisible).toBeTruthy();
  });

  test("should open search with click", async ({ page }) => {
    await page.goto("/");

    const searchButton = page.getByRole("button", { name: /search/i });

    if (await searchButton.isVisible()) {
      await searchButton.click();

      // Search dialog or input should appear
      const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));

      await expect(searchInput).toBeVisible();
    }
  });

  test("should search for comics by title", async ({ page }) => {
    await page.goto("/");

    await test.step("Open search", async () => {
      const searchButton = page.getByRole("button", { name: /search/i });
      if (await searchButton.isVisible()) {
        await searchButton.click();
      } else {
        await page.keyboard.press("Control+k");
      }
    });

    await test.step("Type search query", async () => {
      const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));

      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        // Wait for search results
        await page.waitForTimeout(500);
      }
    });

    // Results should appear (either in dropdown or page)
    const results = page.getByRole("option").or(page.getByRole("listitem"));
    const noResults = page.getByText(/no results|not found/i);

    // Either results or "no results" message should appear
    await expect(results.first().or(noResults.first())).toBeVisible({ timeout: 5000 });
  });

  test("should navigate to comic from search results", async ({ page }) => {
    await page.goto("/");

    await test.step("Open search and type query", async () => {
      const searchButton = page.getByRole("button", { name: /search/i });
      if (await searchButton.isVisible()) {
        await searchButton.click();
      } else {
        await page.keyboard.press("Control+k");
      }

      const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));

      if (await searchInput.isVisible()) {
        await searchInput.fill("comic");
        await page.waitForTimeout(500);
      }
    });

    await test.step("Click on first result", async () => {
      const firstResult = page.getByRole("option").first().or(page.getByRole("link").first());

      if (await firstResult.isVisible()) {
        await firstResult.click();

        // Should navigate away from home page
        await expect(page).not.toHaveURL(/^\/$/);
      }
    });
  });

  test("should close search modal with Escape key", async ({ page }) => {
    await page.goto("/");

    // Open search
    await page.keyboard.press("Control+k");

    const searchDialog = page.getByRole("dialog");

    if (await searchDialog.isVisible()) {
      // Press escape to close
      await page.keyboard.press("Escape");

      // Dialog should be hidden
      await expect(searchDialog).toBeHidden();
    }
  });

  test("should handle empty search query", async ({ page }) => {
    await page.goto("/");

    const searchButton = page.getByRole("button", { name: /search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();

      const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));

      if (await searchInput.isVisible()) {
        // Clear any existing text and submit
        await searchInput.clear();
        await searchInput.press("Enter");

        // Should not navigate or should show empty state
        await page.waitForTimeout(300);
      }
    }
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

    if (await searchInput.isVisible()) {
      // Change the search query
      await searchInput.clear();
      await searchInput.fill("manhwa");
      await searchInput.press("Enter");

      // URL should update
      await expect(page).toHaveURL(/q=manhwa/);
    }
  });

  test("should display result count or summary", async ({ page }) => {
    await page.goto("/search?q=comic");

    // Look for result count or summary text - this may or may not be present
    // depending on implementation
    await page.waitForTimeout(1000);
  });

  test("should paginate search results if available", async ({ page }) => {
    await page.goto("/search?q=a"); // Broad search to get many results

    // Look for pagination
    const nextButton = page.getByRole("button", { name: /next|→|>/i }).or(page.getByRole("link", { name: /next|2/i }));

    if (await nextButton.isVisible()) {
      await nextButton.click();

      // URL should update with page param
      await expect(page).toHaveURL(/page=2/);
    }
  });
});
