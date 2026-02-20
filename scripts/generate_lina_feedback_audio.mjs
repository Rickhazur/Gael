/**
 * Genera MP3 con la voz de la Profe Lina (Microsoft Azure - es-MX-DaliaNeural)
 * para las frases de feedback cuando el niño o la niña contesta bien en matemáticas.
 * Ejecutar: node scripts/generate_lina_feedback_audio.mjs
 * Requiere: VITE_AZURE_SPEECH_KEY y VITE_AZURE_REGION en .env o .env.local
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
    ['.env', '.env.local'].forEach(file => {
        const envPath = path.join(__dirname, '..', file);
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const [key, ...value] = line.split('=');
                if (key && value.length > 0) {
                    let val = value.join('=').trim();
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                    process.env[key.trim()] = val;
                }
            });
        }
    });
}
loadEnv();

const AZURE_KEY = process.env.VITE_AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.VITE_AZURE_REGION;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'lina');

// Frases de feedback (español) - mismas que en data/feedbackPhrases.ts
const PHRASES_ES = [
    '¡Vas volando!',
    '¡Qué bien!',
    '¡Así se hace!',
    '¡Excelente!',
    '¡Muy bien!',
    '¡Genial!',
    '¡Perfecto!',
    '¡Lo lograste!',
    '¡Eso es!',
    '¡Bien hecho!',
    '¡Súper!',
    '¡Increíble!',
    '¡Me encanta cómo piensas!',
    '¡Eres un genio!',
    '¡Sigue así!',
    '¡Bravo!',
    '¡Campeón o campeona!',
    '¡Qué ojo!',
    '¡Exacto!',
    '¡Muy buena!',
];

function slugFor(text) {
    const map = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n',
        '¡': '', '!': '', '?': '', '¿': '', ' ': '_', ',': ''
    };
    return text
        .toLowerCase()
        .split('')
        .map(c => map[c] || (/\w/.test(c) ? c : ''))
        .join('')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'feedback';
}

const VOICE_NAME = 'es-MX-DaliaNeural';
const LANG = 'es-MX';

async function generateAzure(text, filename) {
    if (!AZURE_KEY || !AZURE_REGION) {
        throw new Error('Faltan credenciales: VITE_AZURE_SPEECH_KEY y VITE_AZURE_REGION en .env');
    }

    const outputPath = path.join(OUTPUT_DIR, filename);
    const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const ssml = `
        <speak version='1.0' xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang='${LANG}'>
            <voice name='${VOICE_NAME}'>
                <mstts:express-as style="cheerful">
                    <prosody pitch="+5%" rate="+4%" volume="+10%">
                        ${escapedText}
                    </prosody>
                </mstts:express-as>
            </voice>
        </speak>`;

    const options = {
        hostname: `${AZURE_REGION}.tts.speech.microsoft.com`,
        path: '/cognitiveservices/v1',
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': AZURE_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'Nova-Schola-Feedback-Script'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.error(`❌ ${filename}: ${res.statusCode} - ${data}`);
                    resolve(false);
                });
                return;
            }
            const fileStream = fs.createWriteStream(outputPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ ${filename} <- "${text}"`);
                resolve(true);
            });
        });
        req.on('error', reject);
        req.write(ssml);
        req.end();
    });
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    console.log('🎙️ Generando MP3 de feedback Profe Lina (Azure TTS)...\n');
    for (const text of PHRASES_ES) {
        const slug = slugFor(text);
        const filename = `feedback_${slug}.mp3`;
        await generateAzure(text, filename);
    }
    console.log('\n🏁 Listo. Archivos en public/audio/lina/feedback_*.mp3');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
