import { test, expect } from '@playwright/test';

async function enterStudentDemo(page: any) {
  await page.goto('/');

  // Prefer the main hero demo button on desktop
  const heroDemoButton = page.getByRole('button', { name: /probar demo/i }).first();
  if (await heroDemoButton.isVisible()) {
    await heroDemoButton.click();
  } else {
    // Fallback: mobile menu “Ver Demo”
    const mobileMenuToggle = page.getByRole('button', { name: /menu/i }).first();
    if (await mobileMenuToggle.isVisible()) {
      await mobileMenuToggle.click();
      const verDemoButton = page.getByRole('button', { name: /ver demo/i }).first();
      if (await verDemoButton.isVisible()) {
        await verDemoButton.click();
      }
    }
  }

  // Wait for main student dashboard / campus to load
  await expect(
    page.getByText(/bienvenido,|welcome,/i).first()
  ).toBeVisible({ timeout: 15000 });
}

test.describe('Dashboard & Campus navigation flows', () => {
  test('navigates from demo to Math Tutor from campus', async ({ page }) => {
    await enterStudentDemo(page);

    // Try campus quick card first
    const mathCard = page.getByRole('button', { name: /matemáticas|math tutor|math/i }).first();
    if (await mathCard.isVisible()) {
      await mathCard.click();
    } else {
      // Fallback: sidebar nav item
      const mathSidebar = page.getByRole('button', { name: /profe de mate|math tutor/i }).first();
      await mathSidebar.click();
    }

    // Assert Math Tutor shell appears (no assertion on pedagogy)
    await expect(
      page.getByText(/profe de mate|math tutor/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('navigates from demo to English Tutor from campus', async ({ page }) => {
    await enterStudentDemo(page);

    // Campus quick card for English
    const englishCard = page.getByRole('button', { name: /english buddy|amigo de inglés|english/i }).first();
    if (await englishCard.isVisible()) {
      await englishCard.click();
    } else {
      // Fallback: sidebar nav item
      const englishSidebar = page.getByRole('button', { name: /english buddy|amigo de inglés/i }).first();
      await englishSidebar.click();
    }

    // Assert English Tutor shell appears (no assertion on pedagogy)
    await expect(
      page.getByText(/english buddy|amigo de inglés|english tutor|rachelle/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('opens Research Center from sidebar', async ({ page }) => {
    await enterStudentDemo(page);

    const researchButton = page.getByRole('button', {
      name: /centro de investigación|research center/i,
    }).first();
    await researchButton.click();

    await expect(
      page.getByText(/centro de investigación|research center/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('opens Arena and Missions from dashboard', async ({ page }) => {
    await enterStudentDemo(page);

    // Arena via sidebar
    const arenaButton = page.getByRole('button', {
      name: /arena nova|game arena/i,
    }).first();
    await arenaButton.click();

    await expect(
      page.getByText(/arena/i).first()
    ).toBeVisible({ timeout: 15000 });

    // Missions (Task Control Center) via sidebar
    const missionsButton = page.getByRole('button', {
      name: /misiones|missions/i,
    }).first();
    await missionsButton.click();

    await expect(
      page.getByText(/centro de misiones|task control/i).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('opens Notebook Library and Rewards Store from sidebar', async ({ page }) => {
    await enterStudentDemo(page);

    const notebooksButton = page.getByRole('button', {
      name: /mis cuadernos|my notebooks/i,
    }).first();
    await notebooksButton.click();

    await expect(
      page.getByText(/biblioteca de cuadernos|notebook library|mis cuadernos|my notebooks/i).first()
    ).toBeVisible({ timeout: 15000 });

    const rewardsButton = page.getByRole('button', {
      name: /tienda nova|nova store/i,
    }).first();
    await rewardsButton.click();

    await expect(
      page.getByText(/tienda nova|nova store/i).first()
    ).toBeVisible({ timeout: 15000 });
  });
});

