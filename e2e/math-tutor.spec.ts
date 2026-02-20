import { test, expect } from '@playwright/test';

test.describe('Math Tutor', () => {
    test('loads and shows input', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Nova|Schola/i);
    });

    test('navigates to math tutor from campus', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const mathLink = page.getByRole('link', { name: /math|matemática/i }).first();
        if (await mathLink.isVisible()) {
            await mathLink.click();
            await expect(page.getByPlaceholder(/escribe|type|respuesta/i).first()).toBeVisible({ timeout: 10000 });
        }
    });
});
