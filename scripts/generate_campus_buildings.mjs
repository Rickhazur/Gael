/**
 * Genera edificios del campus con Pollinations.ai (Google Banana Pro).
 * Estilo: isométrico, flotantes, fondo cósmico para integrarse con el tema galaxy.
 * Uso: node scripts/generate_campus_buildings.mjs
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'city');

const BUILDINGS = [
  {
    id: 'research_lab',
    prompt: 'isometric floating island sci-fi laboratory, teal cyan purple domes, holographic screens, pure black background #000000, soft vignette fade to black at edges, glowing structure only, no text, game art, dark void around'
  },
  {
    id: 'english_tower',
    prompt: 'isometric floating island tall tower with glowing blue globe, floating books, pure black background #000000, soft fade to black edges, glowing structure only, no text, futuristic, dark void'
  },
  {
    id: 'math_tower',
    prompt: 'isometric floating island slender tower, neon pink purple blue numbers and shapes, pure black background #000000, soft fade to black at edges, glowing only, no text, game art style'
  },
  {
    id: 'games_arena',
    prompt: 'isometric floating island dome arcade, neon purple pink lights, game controllers, pure black background #000000, soft fade to black edges, glowing structure only, no text, futuristic'
  },
  {
    id: 'mission_control',
    prompt: 'isometric glowing light blue cube hub, round platform below, circuit patterns, pure black background #000000, soft fade to black edges, glowing only, no text, command center'
  }
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Nova-Schola/1.0' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        downloadImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  ensureDir(OUT_DIR);
  console.log('🏗️ Generando edificios del campus con Pollinations.ai (Banana Pro)...\n');
  console.log('   Fondo cósmico para integrarse con el tema galaxy.\n');

  for (let i = 0; i < BUILDINGS.length; i++) {
    const b = BUILDINGS[i];
    const encoded = encodeURIComponent(b.prompt);
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&seed=${seed}&nologo=true`;

    const outPath = path.join(OUT_DIR, `campus_${b.id}.png`);
    try {
      console.log(`[${i + 1}/${BUILDINGS.length}] ${b.id}...`);
      const buffer = await downloadImage(url);
      fs.writeFileSync(outPath, buffer);
      console.log(`   ✅ guardado: campus_${b.id}.png`);
    } catch (err) {
      console.error(`   ❌ error ${b.id}:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('\n🏁 Listo. Las nuevas imágenes están en public/assets/city/campus_*.png');
  console.log('   NovaCampus usará estas imágenes automáticamente.');
}

main();
