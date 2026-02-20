/**
 * Genera imágenes de camisetas cool para niños usando Pollinations.ai (Nano Banana Pro).
 * Uso: node scripts/generate_cool_jerseys.mjs
 * Las imágenes se guardan en public/avatars/jerseys/
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'avatars', 'jerseys');

const JERSEYS = [
  { id: 'axolotl', prompt: 'cute axolotl mascot on kids t-shirt, kawaii style, pastel pink, flat design, children illustration, front view' },
  { id: 'capybara', prompt: 'chill capybara on kids t-shirt, kawaii cute, orange tones, flat design, children illustration, front view' },
  { id: 'frog', prompt: 'cute frog kawaii on kids t-shirt, green, cartoon style, flat design, children illustration, front view' },
  { id: 'space', prompt: 'astronaut and planets on kids t-shirt, space theme, dark blue cosmos, stars, children illustration, front view' },
  { id: 'dino', prompt: 'cute dinosaur T-Rex on kids t-shirt, cartoon style, green, friendly, children illustration, front view' },
  { id: 'rainbow', prompt: 'rainbow tie-dye kids t-shirt design, pastel gradient, soft colors, children fashion, front view' },
  { id: 'unicorn', prompt: 'galactic unicorn on kids t-shirt, sparkles stars, pastel purple pink, kawaii, children illustration, front view' },
  { id: 'dragon', prompt: 'cute fire dragon on kids t-shirt, red orange, friendly cartoon, children illustration, front view' },
  { id: 'neon', prompt: 'neon glow design on kids t-shirt, electric colors, cyber style, children fashion, front view' },
  { id: 'galaxy', prompt: 'galaxy nebula on kids t-shirt, purple blue cosmic, stars, children illustration, front view' },
  { id: 'robot', prompt: 'friendly robot on kids t-shirt, futuristic cute, blue silver, children illustration, front view' },
  { id: 'anime', prompt: 'anime power design on kids t-shirt, energetic, manga style, children illustration, front view' },
  { id: 'squish', prompt: 'squishmallow soft plush style on kids t-shirt, pastel cute, round mascot, children illustration, front view' },
  { id: 'eco', prompt: 'eco superhero planet earth on kids t-shirt, green sustainable, children illustration, front view' },
  { id: 'butterfly', prompt: 'Y2K butterfly on kids t-shirt, glitter style, pink purple, children fashion, front view' },
  { id: 'coquette', prompt: 'coquette bows and ribbons on kids t-shirt, pastel pink, cute, children fashion, front view' },
  { id: 'pixel', prompt: 'cyber pixel blocks on kids t-shirt, 8-bit retro, blue neon, children illustration, front view' },
  { id: 'fortnite', prompt: 'battle royale gaming design on kids t-shirt, energetic, children illustration, front view' },
  { id: 'monster', prompt: 'cute friendly monster on kids t-shirt, kawaii, colorful, children illustration, front view' },
  { id: 'sloth', prompt: 'zen sloth on kids t-shirt, chill relaxed, green brown, kawaii, children illustration, front view' }
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
  console.log('🦎 Generando camisetas cool con Pollinations.ai (Nano Banana Pro)...\n');

  for (let i = 0; i < JERSEYS.length; i++) {
    const j = JERSEYS[i];
    const fullPrompt = `${j.prompt}, clean kids illustration, white or light background`;
    const encoded = encodeURIComponent(fullPrompt);
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true`;

    const outPath = path.join(OUT_DIR, `jersey_${j.id}.png`);
    try {
      console.log(`[${i + 1}/${JERSEYS.length}] ${j.id}...`);
      const buffer = await downloadImage(url);
      fs.writeFileSync(outPath, buffer);
      console.log(`   ✅ guardado: jersey_${j.id}.png`);
    } catch (err) {
      console.error(`   ❌ error ${j.id}:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log('\n🏁 Listo. Actualiza avatars.ts para usar /avatars/jerseys/jersey_XXX.png como icon.');
}

main().catch(console.error);
