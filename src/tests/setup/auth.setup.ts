import { test, expect } from '@playwright/test';

test('setup: sign in with Google and save state', async ({ page }) => {
  await page.goto('/');

  // Click the Google sign-in button
  const signInButton = page.getByRole('button', { name: /sign in with google/i });
  await expect(signInButton).toBeVisible();
  await signInButton.click();

  // Wait for Google OAuth page
  await page.waitForURL(/accounts\.google\.com/, { timeout: 60_000 });

  // Pause for manual login
  await page.pause();

  // After login and redirect back to your app, resume and save state
  await page.context().storageState({ path: 'playwright/.auth/state.json' });
});