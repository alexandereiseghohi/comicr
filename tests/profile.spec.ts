import { expect, test } from "@playwright/test";

test.describe("Profile pages", () => {
  test("redirects to sign-in when unauthenticated", async ({ page, baseURL }) => {
    await page.goto("/profile");
    // For apps that redirect server-side, ensure we land on the sign-in path
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
