/**
 * Genera MP3 con la voz de la Profe Lina (Azure es-MX-DaliaNeural)
 * para frases repetitivas de problemas verbales (tipo tanque) y ahorrar TTS.
 * Ejecutar: node scripts/generate_word_problem_audio.mjs
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

// Frases fijas (español) – mismas claves que en services/elevenlabs.ts LOCAL_AUDIO_MAP
const PHRASES_ES = [
    'Empecemos con calma.',
    'Si estaba lleno solo hasta la mitad, ¿cuántos litros había al principio?',
    'Ahora mira esta parte importante.',
    'Se gastaron dos quintos de lo que había.',
    '¿Cuántos litros quedaron?',
    'Después ocurrió algo bueno.',
    'Ahora lee la pregunta final: ¿Cuántos litros faltan para llenar el tanque por completo?',
    '¿Cuántos litros faltan para llenar el tanque por completo?',
    'La mitad se obtiene dividiendo entre dos.',
    'Divide entre cinco y multiplica por dos.',
    'Faltan se calcula restando del total lo que hay ahora.',
];

const FILE_NAMES = [
    'wp_empecemos.mp3',
    'wp_mitad_pregunta.mp3',
    'wp_mira_parte.mp3',
    'wp_dos_quintos.mp3',
    'wp_cuantos_quedaron.mp3',
    'wp_llovio.mp3',
    'wp_pregunta_final.mp3',
    'wp_faltan_pregunta.mp3',
    'wp_mitad_hint.mp3',
    'wp_divide_cinco.mp3',
    'wp_faltan_hint.mp3',
];

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
            'User-Agent': 'Nova-Schola-WordProblem-Script'
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
    console.log('🎙️ Generando MP3 de problemas verbales (Profe Lina, Azure TTS)...\n');
    for (let i = 0; i < PHRASES_ES.length; i++) {
        const text = PHRASES_ES[i];
        const filename = FILE_NAMES[i] || `wp_${i}.mp3`;
        await generateAzure(text, filename);
    }
    console.log('\n🏁 Listo. Archivos en public/audio/lina/wp_*.mp3');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
