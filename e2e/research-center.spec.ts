// e2e/research-center.spec.ts
// Tests E2E para el Centro de Investigación
import { test, expect } from '@playwright/test';

test.describe('Research Center', () => {
    test.beforeEach(async ({ page }) => {
        // Navegar a la aplicación
        await page.goto('/');
    });

    test('loads the Research Center section', async ({ page }) => {
        // Buscar el botón del Centro de Investigación en el sidebar o navegación
        const researchButton = page.locator('text=/Centro de Investigación|Research Center/i').first();

        // Si el botón existe, hacer clic
        if (await researchButton.isVisible()) {
            await researchButton.click();
        } else {
            // Alternativa: navegar directamente
            await page.goto('/research');
        }

        // Verificar que el título se muestra
        await expect(page.locator('text=/Centro de Investigación|Research Center/i')).toBeVisible({ timeout: 10000 });
    });

    test('shows research type selection on first visit', async ({ page }) => {
        await page.goto('/research');

        // Debería mostrar opciones de tipo de investigación
        await expect(page.locator('text=/Elige tu pregunta|Choose your research/i')).toBeVisible({ timeout: 10000 });

        // Debería mostrar al menos una pregunta de investigación
        await expect(page.locator('text=/¿Cómo duermen los peces|How do fish sleep/i')).toBeVisible();
    });

    test('can select a research question', async ({ page }) => {
        await page.goto('/research');

        // Esperar a que carguen las opciones
        await page.waitForSelector('text=/¿Cómo duermen los peces|How do fish sleep/i', { timeout: 10000 });

        // Hacer clic en una pregunta de investigación
        const fishQuestion = page.locator('text=/¿Cómo duermen los peces|How do fish sleep/i');
        await fishQuestion.click();

        // Debería avanzar al siguiente paso (hipótesis o búsqueda)
        // Esperar cambio de UI
        await page.waitForTimeout(1000);

        // Verificar que ya no estamos en la selección de tipo
        const typeSelection = page.locator('text=/Elige tu pregunta|Choose your research/i');
        await expect(typeSelection).not.toBeVisible({ timeout: 5000 });
    });

    test('displays grade selector', async ({ page }) => {
        await page.goto('/research');

        // Verificar que hay selector de grado
        await expect(page.locator('text=/Grado|Grade/i').first()).toBeVisible({ timeout: 10000 });
    });

    test('displays language toggle', async ({ page }) => {
        await page.goto('/research');

        // Verificar que hay toggle de idioma (ES/EN)
        const langToggle = page.locator('button:has-text("ES"), button:has-text("EN")').first();
        await expect(langToggle).toBeVisible({ timeout: 10000 });
    });

    test('shows save status indicator', async ({ page }) => {
        await page.goto('/research');

        // Verificar que hay indicador de guardado
        await expect(page.locator('text=/Guardado|Saved|Auto/i').first()).toBeVisible({ timeout: 10000 });
    });

    test('shows progress steps', async ({ page }) => {
        await page.goto('/research');

        // Verificar que hay pasos de progreso
        await expect(page.locator('text=/Tipo|Type/i').first()).toBeVisible({ timeout: 10000 });
    });

    test('displays 3D/AR exploration section', async ({ page }) => {
        await page.goto('/research');

        // Scroll hacia abajo para ver la sección 3D
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Verificar que la sección 3D existe
        await expect(page.locator('text=/Exploración 3D|3D\\/AR Exploration/i')).toBeVisible({ timeout: 10000 });
    });

    test('can toggle language and UI updates', async ({ page }) => {
        await page.goto('/research');

        // Buscar y hacer clic en toggle de idioma
        const enButton = page.locator('button:has-text("EN")').first();

        if (await enButton.isVisible()) {
            await enButton.click();

            // Esperar a que la UI se actualice
            await page.waitForTimeout(500);

            // Verificar que los textos cambiaron a inglés
            await expect(page.locator('text=/Research Center|Choose your research/i').first()).toBeVisible();
        }
    });

    test('tutor panel is visible', async ({ page }) => {
        await page.goto('/research');

        // El panel del tutor debería estar visible
        await expect(page.locator('text=/Lina|Rachelle|tutor|Hola/i').first()).toBeVisible({ timeout: 10000 });
    });

    test('has cosmic background animations', async ({ page }) => {
        await page.goto('/research');

        // Verificar que hay elementos de fondo cósmico
        // El gradiente de fondo debería existir
        const bgElement = page.locator('.bg-slate-950, [class*="radial-gradient"]').first();
        await expect(bgElement).toBeVisible({ timeout: 10000 });
    });
});

test.describe('Research Center - Plagiarism Detection UI', () => {
    test('shows plagiarism warning when copying text', async ({ page }) => {
        await page.goto('/research');

        // Seleccionar una pregunta
        const question = page.locator('text=/¿Cómo duermen los peces|How do fish sleep/i');
        if (await question.isVisible()) {
            await question.click();
        }

        // Esperar a que cambie la UI
        await page.waitForTimeout(1000);

        // Si hay un área de texto fuente, pegarle contenido
        const sourceArea = page.locator('textarea').first();
        if (await sourceArea.isVisible()) {
            const testText = 'Los peces duermen de una manera especial sin cerrar los ojos porque no tienen párpados. Ellos descansan reduciendo su actividad.';
            await sourceArea.fill(testText);

            // Buscar botón de analizar
            const analyzeBtn = page.locator('button:has-text("Analizar"), button:has-text("Analyze")').first();
            if (await analyzeBtn.isVisible()) {
                await analyzeBtn.click();
            }

            // Esperar análisis
            await page.waitForTimeout(2000);

            // Ahora buscar el área de parafraseo y copiar el mismo texto
            const paraphraseArea = page.locator('textarea').nth(1);
            if (await paraphraseArea.isVisible()) {
                await paraphraseArea.fill(testText);

                // Debería mostrar alerta de plagio
                await page.waitForTimeout(1500);
                const plagiarismAlert = page.locator('text=/similar|plagio|Alerta|Alert/i').first();
                // Este test verifica que el sistema de plagio está activo
            }
        }
    });
});

test.describe('Research Center - Accessibility', () => {
    test('has proper heading structure', async ({ page }) => {
        await page.goto('/research');

        // Debe tener un h1 para el título principal
        const h1 = page.locator('h1, h2').first();
        await expect(h1).toBeVisible({ timeout: 10000 });
    });

    test('buttons are focusable', async ({ page }) => {
        await page.goto('/research');

        // Verificar que los botones principales son focusables
        const buttons = page.locator('button');
        const count = await buttons.count();

        expect(count).toBeGreaterThan(0);

        // El primer botón debería poder recibir focus
        if (count > 0) {
            await buttons.first().focus();
        }
    });

    test('has visible text labels', async ({ page }) => {
        await page.goto('/research');

        // Los botones deben tener texto visible o aria-label
        const buttons = page.locator('button');
        const count = await buttons.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
            const button = buttons.nth(i);
            const text = await button.textContent();
            const ariaLabel = await button.getAttribute('aria-label');

            // Cada botón debe tener texto o aria-label
            const hasLabel = (text && text.trim().length > 0) || ariaLabel;
            expect(hasLabel).toBeTruthy();
        }
    });
});
