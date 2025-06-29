import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/state.json' });

test('setup: sign out and save unauthenticated state', async ({ page }) => {
  await page.goto('/');

  // Si ya está deslogueado, guarda el estado y termina
  const signInButton = page.getByRole('button', { name: /sign in/i });
  if (await signInButton.isVisible()) {
    await page.context().storageState({ path: 'playwright/.auth/unauthenticated.json' });
    return;
  }

  // Si no, busca el avatar (ajusta el selector según tu UI real)
  // Ejemplo: busca por aria-label, alt, o un texto visible
  const avatarButton = page.locator('[aria-label="Open user menu"], img[alt*="avatar"], button:has([data-testid="user-avatar"])').first();
  await expect(avatarButton).toBeVisible();
  await avatarButton.click();

  // Haz clic en "Sign Out"
  const signOutButton = page.getByRole('button', { name: /sign out/i });
  await expect(signOutButton).toBeVisible();
  await signOutButton.click();

  // Espera a que el botón de "Sign In" sea visible (usuario deslogueado)
  await expect(signInButton).toBeVisible();

  // Guarda el estado deslogueado
  await page.context().storageState({ path: 'playwright/.auth/unauthenticated.json' });
});