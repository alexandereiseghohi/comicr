import { expect, test } from "@playwright/test";

test.describe("Profile pages", () => {
  test("redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
