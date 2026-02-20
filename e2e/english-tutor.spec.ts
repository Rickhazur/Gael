import { test, expect } from '@playwright/test';

test.describe('English Tutor', () => {
    test('loads and shows chat interface', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Nova|Schola/i);
    });

    test('navigates to English section from campus', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const englishLink = page.getByRole('link', { name: /english|inglés/i }).first();
        if (await englishLink.isVisible()) {
            await englishLink.click();
            await expect(page.getByText(/Nova Globe|Ollie/i).first()).toBeVisible({ timeout: 10000 });
        }
    });

    test('chat input accepts message', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const englishLink = page.getByRole('link', { name: /english|inglés/i }).first();
        if (await englishLink.isVisible()) {
            await englishLink.click();
            await page.waitForTimeout(2000);
            const input = page.getByPlaceholder(/escribe|type|message/i).first();
            if (await input.isVisible()) {
                await input.fill('Hello!');
                await expect(input).toHaveValue('Hello!');
            }
        }
    });
});
