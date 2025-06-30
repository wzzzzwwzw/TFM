import { test, expect } from '@playwright/test';

test.describe('Statistics Page', () => {
  // ✅ Use your local dev URL
  const baseURL = 'http://localhost:3000';
  // ✅ Use a real game ID in your DB
  const testGameId = 'cmaxur7ui00016vask166bf1g';

  // ✅ This is optional because storageState is global in playwright.config.ts
  // If you didn’t add it globally, do it here:
  test.use({ storageState: 'storageState.json' });

  test('renders statistics summary and components', async ({ page }) => {
    // ✅ You’re already logged in via saved session
    await page.goto(`${baseURL}/statistics/${testGameId}`);

    // ✅ Check heading
    await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();

    // ✅ Check main cards by text inside them
    await expect(page.getByText('Results')).toBeVisible();
    await expect(page.getByText('Accuracy')).toBeVisible();
    await expect(page.getByText('Time Taken')).toBeVisible();
    // For the questions list, check for any question text or the component's heading
    await expect(page.getByText('Questions')).toBeVisible();

    // ✅ Back to Dashboard link
    await page.getByRole('link', { name: /Back to Dashboard/i }).click();
    await expect(page).toHaveURL(`${baseURL}/dashboard`);
  });

  test('redirects to / if no session', async ({ page }) => {
    // ✅ Clear cookies to simulate logged-out
    await page.context().clearCookies();

    await page.goto(`${baseURL}/statistics/${testGameId}`);

    // Should redirect to home or login
    await expect(page).toHaveURL(baseURL + '/');
  });
});
