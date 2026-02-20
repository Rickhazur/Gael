import { test, expect } from '@playwright/test';

async function enterStudentDemo(page: any) {
  await page.goto('/');

  const heroDemoButton = page.getByRole('button', { name: /probar demo/i }).first();
  if (await heroDemoButton.isVisible()) {
    await heroDemoButton.click();
  } else {
    const quickDemo = page.getByRole('button', { name: /ver demo rápido/i }).first();
    if (await quickDemo.isVisible()) {
      await quickDemo.click();
    }
  }

  await expect(
    page.getByText(/bienvenido,|welcome,/i).first()
  ).toBeVisible({ timeout: 15000 });
}

test.describe('Subscription and Rewards flows', () => {
  test('opens Subscription page from sidebar', async ({ page }) => {
    await enterStudentDemo(page);

    const upgradeButton = page.getByRole('button', {
      name: /mejorar plan|upgrade plan/i,
    }).first();
    await upgradeButton.click();

    await expect(
      page.getByText(/elige tu poder premium/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('opens Nova Store (rewards) from sidebar', async ({ page }) => {
    await enterStudentDemo(page);

    const rewardsButton = page.getByRole('button', {
      name: /tienda nova|nova store/i,
    }).first();
    await rewardsButton.click();

    await expect(
      page.getByText(/tienda nova|nova store/i).first()
    ).toBeVisible({ timeout: 15000 });
  });
});

