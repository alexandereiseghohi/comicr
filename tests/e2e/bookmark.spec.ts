import { expect, test } from "@playwright/test";

test.describe("Bookmark smoke", () => {
  test("comic detail shows bookmark button", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/comics`);

    // Click the first comic link on the list
    const firstLink = page.locator('a[href^="/comics/"]').first();
    await expect(firstLink).toHaveCount(1);
    await firstLink.click();

    // Expect the bookmark button (client component) to be present
    const bookmarkBtn = page.getByRole("button", { name: /Add Bookmark|Bookmarked/ });
    await expect(bookmarkBtn).toBeVisible();
  });
  test("comic detail bookmark flow (sign-in + add/remove)", async ({ page, baseURL }) => {
    const TEST_EMAIL = process.env.E2E_TEST_EMAIL;
    const TEST_PASS = process.env.E2E_TEST_PASS;

    await page.goto(`${baseURL}/comics`);

    // Click the first comic link on the list
    const firstLink = page.locator('a[href^="/comics/"]').first();
    await expect(firstLink).toHaveCount(1);
    await firstLink.click();

    // Expect the bookmark button (client component) to be present
    const bookmarkBtn = page.getByRole("button", {
      name: /Add Bookmark|Bookmarked|Sign in to bookmark/,
    });
    await expect(bookmarkBtn).toBeVisible();

    // If test credentials are provided, perform sign-in and full add/remove flow
    if (TEST_EMAIL && TEST_PASS) {
      // If button prompts sign-in, navigate to sign-in page
      const btnText = await bookmarkBtn.innerText();
      if (/Sign in/i.test(btnText)) {
        await page.goto(`${baseURL}/auth/sign-in`);
        await page.getByLabel("Email").fill(TEST_EMAIL);
        await page.getByLabel("Password").fill(TEST_PASS);
        await page.getByRole("button", { name: "Sign In" }).click();
        // wait for redirect to home or comics
        await page.waitForURL("**/comics", { timeout: 5000 }).catch(() => {});
        // navigate back to comics and open first comic again
        await page.goto(`${baseURL}/comics`);
        await firstLink.click();
      }

      // Now perform add bookmark
      const btn = page.getByRole("button", { name: /Add Bookmark|Bookmarked/ });
      await btn.click();
      await expect(btn).toHaveText(/Bookmarked/);

      // Remove bookmark
      await btn.click();
      await expect(btn).toHaveText(/Add Bookmark/);
    }
  });
});
