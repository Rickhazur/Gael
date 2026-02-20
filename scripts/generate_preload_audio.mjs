/**
 * Genera MP3 precargados desde data/preloadAudioPhrases.json y muestra entradas para LOCAL_AUDIO_MAP.
 * Objetivo: bajar costo TTS (Azure/ElevenLabs) usando audio estático.
 *
 * Uso: node scripts/generate_preload_audio.mjs
 * Requiere: VITE_AZURE_SPEECH_KEY y VITE_AZURE_REGION en .env o .env.local
 *
 * Después: copia las líneas que imprime y pégalas en LOCAL_AUDIO_MAP en services/elevenlabs.ts
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

function loadEnv() {
    ['.env', '.env.local'].forEach(file => {
        const envPath = path.join(ROOT, file);
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

const VOICE_CONFIG = {
    lina: { voice: 'es-MX-DaliaNeural', lang: 'es-MX' },
    rachelle: { voice: 'en-US-JennyNeural', lang: 'en-US' },
};

function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function buildSsml(text, voiceKey) {
    const { voice, lang } = VOICE_CONFIG[voiceKey] || VOICE_CONFIG.lina;
    const escaped = escapeXml(text);
    return `<speak version='1.0' xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang='${lang}'>
<voice name='${voice}'><mstts:express-as style="cheerful"><prosody pitch="+5%" rate="+4%" volume="+10%">${escaped}</prosody></mstts:express-as></voice>
</speak>`;
}

function generateAzure(text, voiceKey) {
    return new Promise((resolve, reject) => {
        if (!AZURE_KEY || !AZURE_REGION) {
            reject(new Error('Faltan VITE_AZURE_SPEECH_KEY y VITE_AZURE_REGION en .env'));
            return;
        }
        const ssml = buildSsml(text, voiceKey);
        const options = {
            hostname: `${AZURE_REGION}.tts.speech.microsoft.com`,
            path: '/cognitiveservices/v1',
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': AZURE_KEY,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                'User-Agent': 'Nova-Schola-Preload-Script',
            },
        };
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    reject(new Error(`${res.statusCode}: ${data}`));
                });
                return;
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        });
        req.on('error', reject);
        req.write(ssml);
        req.end();
    });
}

function escapeForMap(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

async function main() {
    const jsonPath = path.join(ROOT, 'data', 'preloadAudioPhrases.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('No existe data/preloadAudioPhrases.json');
        process.exit(1);
    }
    const list = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!Array.isArray(list) || list.length === 0) {
        console.log('Lista vacía. Añade objetos { "text": "...", "path": "lina/archivo.mp3", "voice": "lina" } en data/preloadAudioPhrases.json');
        return;
    }

    const mapEntries = [];
    const audioDir = path.join(ROOT, 'public', 'audio');

    console.log('🎙️ Generando MP3 desde data/preloadAudioPhrases.json...\n');

    for (const item of list) {
        const { text, path: relPath, voice = 'lina' } = item;
        if (!text || !relPath) {
            console.warn('⚠️ Entrada sin text o path:', item);
            continue;
        }
        const outPath = path.join(audioDir, relPath);
        const outDir = path.dirname(outPath);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        try {
            const buffer = await generateAzure(text, voice);
            fs.writeFileSync(outPath, buffer);
            console.log(`✅ ${relPath}`);
        } catch (e) {
            console.error(`❌ ${relPath}:`, e.message);
        }

        const mapKey = escapeForMap(text);
        const mapValue = `/audio/${relPath.replace(/\\/g, '/')}`;
        mapEntries.push(`    "${mapKey}": "${mapValue}"`);
    }

    console.log('\n--- Copia estas líneas en LOCAL_AUDIO_MAP (services/elevenlabs.ts) ---\n');
    mapEntries.forEach((line) => console.log(line));
    console.log('\n--- Fin ---');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
