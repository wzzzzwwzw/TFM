import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/state.json' });

test('user can sign out', async ({ page }) => {
  await page.goto('/');

  // Open user menu
  const avatarButton = page.locator('[aria-label="Open user menu"], img[alt*="avatar"], button:has([data-testid="user-avatar"])').first();
  await expect(avatarButton).toBeVisible();
  await avatarButton.click();

  // Click Sign Out
  const signOutButton = page.getByRole('button', { name: /sign out/i });
  await expect(signOutButton).toBeVisible();
  await signOutButton.click();

  // Check that Sign In button is visible again
  const signInButton = page.getByRole('button', { name: /sign in/i });
  await expect(signInButton).toBeVisible();
});