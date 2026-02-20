/**
 * Genera MP3 del avatar de Research Center (Station AI) con voz robotizada.
 * - Español: es-MX-JorgeNeural (profunda) + prosody robotizado
 * - Inglés: en-US-GuyNeural (deep robot, mismo estilo)
 * Uso: node scripts/generate_research_station_audio.mjs
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function loadEnv() {
    ['.env', '.env.local'].forEach((file) => {
        const p = path.join(ROOT, file);
        if (fs.existsSync(p)) {
            fs.readFileSync(p, 'utf8').split('\n').forEach((line) => {
                const [key, ...v] = line.split('=');
                if (key && v.length) {
                    let val = v.join('=').trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
                    process.env[key.trim()] = val;
                }
            });
        }
    });
}
loadEnv();

const AZURE_KEY = process.env.VITE_AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.VITE_AZURE_REGION;
const OUTPUT_DIR = path.join(ROOT, 'public', 'audio', 'station');

// Voz robotizada y profunda: pitch muy bajo, rate lento
const STATION_GREETINGS = [
    {
        filename: 'research_greeting_es.mp3',
        text: 'Yo soy tu director de investigación y te voy a ayudar con tu investigación.',
        voice: 'es-MX-JorgeNeural',
        lang: 'es-MX',
        pitch: '-15%',
        rate: '0.85',
    },
    {
        filename: 'research_greeting_en.mp3',
        text: "Hi there, I'm your research director and I am going to help you with your research.",
        voice: 'en-US-GuyNeural',
        lang: 'en-US',
        pitch: '-15%',
        rate: '0.85',
    },
];

async function generateAzureRoboticAudio(asset) {
    const filePath = path.join(OUTPUT_DIR, asset.filename);
    const escapedText = asset.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const ssml = `
<speak version='1.0' xmlns="http://www.w3.org/2001/10/synthesis" xml:lang='${asset.lang}'>
  <voice name='${asset.voice}'>
    <prosody pitch="${asset.pitch}" rate="${asset.rate}" volume="+5%">
      ${escapedText}
    </prosody>
  </voice>
</speak>`.trim();

    const options = {
        hostname: `${AZURE_REGION}.tts.speech.microsoft.com`,
        path: '/cognitiveservices/v1',
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': AZURE_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'Node',
        },
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`❌ Error ${asset.filename}: ${res.statusCode}`);
                let body = '';
                res.on('data', (d) => (body += d));
                res.on('end', () => {
                    console.error(`   Body: ${body}`);
                    resolve(false);
                });
                return;
            }
            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ Saved: ${asset.filename}`);
                resolve(true);
            });
        });
        req.on('error', (e) => {
            console.error(e);
            resolve(false);
        });
        req.write(ssml);
        req.end();
    });
}

async function main() {
    if (!AZURE_KEY || !AZURE_REGION) {
        console.error('Faltan VITE_AZURE_SPEECH_KEY y VITE_AZURE_REGION en .env');
        process.exit(1);
    }
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('🎙️ Generando MP3 del avatar Station (voz robotizada)...\n');
    for (const asset of STATION_GREETINGS) {
        await generateAzureRoboticAudio(asset);
    }
    console.log('\n🏁 Listo. Archivos en public/audio/station/');
}

main();
