import { test, expect } from '@playwright/test';

test('user can see Google Sign In with Google button', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const signInButton = page.getByRole('button', { name: /sign in with google/i });
  await expect(signInButton).toBeVisible();
});