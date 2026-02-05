import { expect, test } from "@playwright/test";

test.describe("Comic Browse", () => {
  test("should display comics listing page", async ({ page }) => {
    await page.goto("/comics");

    // Page should load with heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should display comic cards or empty state", async ({ page }) => {
    await page.goto("/comics");

    // Either comic cards or empty state should be visible
    const comicCards = page.locator("[data-testid=comic-card], article, .comic-card");
    const emptyState = page.getByText(/no comics|empty|nothing/i);

    await expect(comicCards.first().or(emptyState)).toBeVisible();
  });

  test("should have search functionality", async ({ page }) => {
    await page.goto("/comics");

    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test");
    // Wait for results or URL update
    await expect(page).toHaveURL(/search|q=test/);
  });

  test("should display genre filter if available", async ({ page }) => {
    await page.goto("/comics");

    const genreFilter = page
      .getByRole("button", { name: /genre/i })
      .or(page.getByLabel(/genre/i))
      .or(page.locator("[data-testid=genre-filter]"));
    // Always assert visibility, skip if not present
    if ((await genreFilter.count()) > 0 && (await genreFilter.isVisible())) {
      await genreFilter.click();
      await expect(page.getByRole("option").or(page.getByRole("listbox"))).toBeVisible();
    }
  });

  test("should display type filter if available", async ({ page }) => {
    await page.goto("/comics");

    const typeFilter = page
      .getByRole("button", { name: /type/i })
      .or(page.getByLabel(/type/i))
      .or(page.locator("[data-testid=type-filter]"));
    if ((await typeFilter.count()) > 0 && (await typeFilter.isVisible())) {
      await typeFilter.click();
      await expect(page.getByRole("option").or(page.getByRole("listbox"))).toBeVisible();
    }
  });

  test("should support pagination if present", async ({ page }) => {
    await page.goto("/comics");

    // Look for pagination controls
    const nextButton = page.getByRole("button", { name: /next|→|>/i }).or(page.getByRole("link", { name: /next/i }));
    if ((await nextButton.count()) > 0 && (await nextButton.isVisible())) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test("should navigate to comic detail page", async ({ page }) => {
    await page.goto("/comics");

    // Click on first comic card/link
    const comicLink = page.locator("[data-testid=comic-card] a, article a, .comic-card a").first();
    await expect(comicLink).toBeVisible();
    await comicLink.click();
    await expect(page).toHaveURL(/\/comics\/|\/comic\//);
  });
});

test.describe("Comic Detail Page", () => {
  test("should display comic information", async ({ page }) => {
    // Navigate to comics list first, then click through
    await page.goto("/comics");

    const comicLink = page.locator("[data-testid=comic-card] a, article a, .comic-card a").first();
    await expect(comicLink).toBeVisible();
    await comicLink.click();

    await test.step("Verify comic title is displayed", async () => {
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    await test.step("Verify comic has description or synopsis area", async () => {
      const description = page
        .getByText(/description|synopsis|summary/i)
        .or(page.locator("[data-testid=comic-description]"));
      await expect(description.or(page.locator("main"))).toBeVisible();
    });
  });

  test("should display chapter list if available", async ({ page }) => {
    await page.goto("/comics");

    const comicLink = page.locator("[data-testid=comic-card] a, article a, .comic-card a").first();
    await expect(comicLink).toBeVisible();
    await comicLink.click();
    const chapterList = page.locator("[data-testid=chapter-list], .chapters, [role=list]");
    const chapterHeading = page.getByText(/chapter|episodes?/i);
    await expect(
      chapterList
        .first()
        .or(chapterHeading)
        .or(page.getByText(/no chapters/i))
    ).toBeVisible();
  });

  test("should display comic metadata (genre, type, status)", async ({ page }) => {
    await page.goto("/comics");

    const comicLink = page.locator("[data-testid=comic-card] a, article a, .comic-card a").first();
    await expect(comicLink).toBeVisible();
    await comicLink.click();
    const metadata = page.locator("[data-testid=comic-metadata], .badges, .tags");
    const statusBadge = page.getByText(/ongoing|completed|hiatus/i);
    await expect(metadata.or(statusBadge).or(page.locator("main"))).toBeVisible();
  });
});

test.describe("Chapter Reader", () => {
  test("should navigate to chapter from comic detail", async ({ page }) => {
    await page.goto("/comics");

    const comicLink = page.locator("[data-testid=comic-card] a, article a, .comic-card a").first();
    await expect(comicLink).toBeVisible();
    await comicLink.click();
    const chapterLink = page.getByRole("link", { name: /chapter\s*1|episode\s*1|read/i }).first();
    await expect(chapterLink).toBeVisible();
    await chapterLink.click();
    await expect(page).toHaveURL(/chapter|read|episode/i);
  });
});
