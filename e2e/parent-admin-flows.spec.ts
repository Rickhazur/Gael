import { test, expect } from '@playwright/test';

async function goToLoginFromLanding(page: any) {
  await page.goto('/');
  const loginButton = page.getByRole('button', { name: /iniciar sesión|login/i }).first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
  } else {
    // Fallback: scroll and try again
    await page.mouse.wheel(0, 400);
    await loginButton.click();
  }
}

test.describe('Parent and Admin login flows', () => {
  test('Parent demo can reach Parent Dashboard', async ({ page }) => {
    await goToLoginFromLanding(page);

    // Switch to Parents tab if needed
    const parentTab = page.getByRole('button', { name: /padres|parents/i }).first();
    if (await parentTab.isVisible()) {
      await parentTab.click();
    }

    // Fill demo parent credentials handled in App.tsx
    await page.getByPlaceholder(/correo|email/i).first().fill('padre.andres@novaschola.com');
    await page.getByPlaceholder(/contraseña|password/i).first().fill('padre2024');

    const submit = page.getByRole('button', { name: /iniciar aventura|login|iniciar sesión/i }).first();
    await submit.click();

    // Parent dashboard should be visible
    await expect(
      page.getByText(/panel de padres|parent panel/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('Admin tab renders without crashing (smoke)', async ({ page }) => {
    await goToLoginFromLanding(page);

    const adminTab = page.getByRole('button', { name: /admin/i }).first();
    if (await adminTab.isVisible()) {
      await adminTab.click();
    }

    // Just ensure the form renders; no real admin demo account wired here
    await expect(
      page.getByPlaceholder(/correo|email/i).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByPlaceholder(/contraseña|password/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});

