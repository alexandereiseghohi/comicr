import { expect, test } from "@playwright/test";

test.describe("Admin Panel", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user (assumes seeded test admin exists)
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL ?? "admin@comicwise.test");
    await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASS ?? "TestAdmin123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Wait for redirect after login
    await expect(page).not.toHaveURL(/sign-in/);
  });

  test("should access admin dashboard", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /dashboard|admin/i })).toBeVisible();
  });

  test.describe("Authors CRUD", () => {
    test("should navigate to authors list", async ({ page }) => {
      await page.goto("/admin");
      await page.getByRole("link", { name: /authors/i }).click();
      await expect(page).toHaveURL("/admin/authors");
      await expect(page.getByRole("heading", { name: /authors/i })).toBeVisible();
    });

    test("should display authors table", async ({ page }) => {
      await page.goto("/admin/authors");
      const table = page.getByRole("table");
      const empty = page.getByText(/no authors/i);
      await expect(table.or(empty)).toBeVisible();
    });

    test("should navigate to create author page", async ({ page }) => {
      await page.goto("/admin/authors");
      await page.getByRole("link", { name: /add author|new author|create/i }).click();
      await expect(page).toHaveURL("/admin/authors/new");
    });

    test("should create new author", async ({ page }) => {
      await page.goto("/admin/authors/new");
      await page.getByLabel(/name/i).fill("E2E Test Author");
      const bioField = page.getByLabel(/bio/i);
      if ((await bioField.count()) > 0 && (await bioField.isVisible())) {
        await bioField.fill("A test author created by E2E tests");
      }
      await page.getByRole("button", { name: /create|save|submit/i }).click();
      await expect(page).toHaveURL("/admin/authors");
    });

    test("should show validation error for empty name", async ({ page }) => {
      await page.goto("/admin/authors/new");
      await page.getByRole("button", { name: /create|save|submit/i }).click();
      const error = page.getByText(/required|name/i).or(page.locator("[aria-invalid=true]"));
      await expect(error).toBeVisible();
    });
  });

  test.describe("Artists CRUD", () => {
    test("should navigate to artists list", async ({ page }) => {
      await page.goto("/admin");
      await page.getByRole("link", { name: /artists/i }).click();
      await expect(page).toHaveURL("/admin/artists");
      await expect(page.getByRole("heading", { name: /artists/i })).toBeVisible();
    });

    test("should display artists table", async ({ page }) => {
      await page.goto("/admin/artists");
      const table = page.getByRole("table");
      const empty = page.getByText(/no artists/i);
      await expect(table.or(empty)).toBeVisible();
    });

    test("should navigate to create artist page", async ({ page }) => {
      await page.goto("/admin/artists");
      await page.getByRole("link", { name: /add artist|new artist|create/i }).click();
      await expect(page).toHaveURL("/admin/artists/new");
    });
  });

  test.describe("Genres CRUD", () => {
    test("should navigate to genres list", async ({ page }) => {
      await page.goto("/admin");
      await page.getByRole("link", { name: /genres/i }).click();
      await expect(page).toHaveURL("/admin/genres");
      await expect(page.getByRole("heading", { name: /genres/i })).toBeVisible();
    });

    test("should display genres table", async ({ page }) => {
      await page.goto("/admin/genres");
      const table = page.getByRole("table");
      const empty = page.getByText(/no genres/i);
      await expect(table.or(empty)).toBeVisible();
    });

    test("should create new genre", async ({ page }) => {
      await page.goto("/admin/genres/new");

      await test.step("Fill genre form", async () => {
        await page.getByLabel(/name/i).fill("E2E Test Genre");
        const slugField = page.getByLabel(/slug/i);
        if (await slugField.isVisible()) {
          await slugField.fill("e2e-test-genre");
        }
      });

      await test.step("Submit form", async () => {
        await page.getByRole("button", { name: /create|save|submit/i }).click();
      });

      await test.step("Verify redirect", async () => {
        await expect(page).toHaveURL("/admin/genres");
      });
    });

    test("should auto-generate slug from name", async ({ page }) => {
      await page.goto("/admin/genres/new");

      const nameInput = page.getByLabel(/name/i);
      await nameInput.fill("Action Adventure");
      await nameInput.blur();

      const slugInput = page.getByLabel(/slug/i);
      if ((await slugInput.count()) > 0 && (await slugInput.isVisible())) {
        await expect(slugInput).toHaveValue(/action-adventure/i);
      }
    });
  });

  test.describe("Types CRUD", () => {
    test("should navigate to types list", async ({ page }) => {
      await page.goto("/admin");
      await page.getByRole("link", { name: /types/i }).click();
      await expect(page).toHaveURL("/admin/types");
      await expect(page.getByRole("heading", { name: /types/i })).toBeVisible();
    });

    test("should display types table", async ({ page }) => {
      await page.goto("/admin/types");
      const table = page.getByRole("table");
      const empty = page.getByText(/no types/i);
      await expect(table.or(empty)).toBeVisible();
    });

    test("should navigate to create type page", async ({ page }) => {
      await page.goto("/admin/types");
      await page.getByRole("link", { name: /add type|new type|create/i }).click();
      await expect(page).toHaveURL("/admin/types/new");
    });
  });

  test.describe("Navigation", () => {
    test("should display metadata section in sidebar", async ({ page }) => {
      await page.goto("/admin");
      // Verify metadata nav items are visible
      await expect(page.getByRole("link", { name: /authors/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /artists/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /genres/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /types/i })).toBeVisible();
    });
  });
});
