/**
 * Captura screenshots de Nova Schola Elementary
 * Ejecutar con: node scripts/capture_screenshots.mjs
 * Requiere: servidor dev corriendo (npm run dev) y Playwright instalado
 */

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3001';
const OUT_DIR = join(__dirname, '..', 'docs', 'screenshots');
const VIEWPORT_DESKTOP = { width: 1920, height: 1080 };
const VIEWPORT_MOBILE = { width: 390, height: 844 };

async function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function main() {
  ensureDir(OUT_DIR);
  console.log('📸 Iniciando capturas en', OUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT_DESKTOP,
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  try {
    const page = await context.newPage();

    // 1. Página de login (escritorio)
    console.log('Capturando: Login (desktop)...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(OUT_DIR, '01_login_desktop.png'),
      fullPage: true,
    });

    // Intentar login para llegar al campus
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i], input[placeholder*="correo" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Entrar"), button:has-text("Login")').first();

    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('piloto.quinto@novaschola.com');
      await passwordInput.fill('piloto2024');
      await page.waitForTimeout(500);
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(4000); // Esperar carga post-login
      }
    }

    // 2. Campus / mapa principal (desktop)
    console.log('Capturando: Campus mapa (desktop)...');
    await page.setViewportSize(VIEWPORT_DESKTOP);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(OUT_DIR, '02_campus_mapa_desktop.png'),
      fullPage: false,
    });

    // 3. Campus full page si hay scroll
    await page.screenshot({
      path: join(OUT_DIR, '03_campus_full_desktop.png'),
      fullPage: true,
    });

    // 4. Vista móvil
    console.log('Capturando: Vista móvil...');
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(OUT_DIR, '04_mobile_dashboard.png'),
      fullPage: true,
    });

    console.log('✅ Capturas guardadas en docs/screenshots/');
  } catch (err) {
    console.error('Error:', err.message);
    // Captura aunque falle el login (p.ej. sin Supabase)
    try {
      const page = context.pages()[0] || await context.newPage();
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: join(OUT_DIR, '00_home_fallback.png'),
        fullPage: true,
      });
      console.log('📷 Guardada captura de respaldo en 00_home_fallback.png');
    } catch (e) {
      console.error('No se pudo guardar captura de respaldo:', e.message);
    }
  } finally {
    await browser.close();
  }
}

main();
