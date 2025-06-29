import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {

  test("user can sign in with Google", async ({ page, context }) => {
    // 1. Visit the page with the sign-in button
    await page.goto("/");

    // 2. Click the sign-in button
    await page.getByRole("button", { name: "Sign In with Google" }).click();

    // 3. Handle the Google OAuth page
    // 👉 Playwright can't handle real Google login in CI — so:
    // - Use a test account
    // - OR mock it, OR run on local with credentials.

    // For demo: wait for redirect back to app
    await page.waitForURL(/.*callback.*/);

    // 4. Verify session is active
    await page.goto("/");
    await expect(page.getByText("Signed in as")).toBeVisible();

    // 5. Optionally call sign-out
    await page.evaluate(async () => {
      await fetch("/api/sign-out");
    });

    // 6. Reload and verify signed out
    await page.reload();
    await expect(page.getByRole("button", { name: "Sign In with Google" })).toBeVisible();
  });

});
