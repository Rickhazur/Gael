/**
 * Genera MP3 con varias maneras de saludar al estudiante (Profe Lina - Azure es-MX-DaliaNeural)
 * para que no se sienta robotizado. Se usa en misiones MATH y sesión abierta.
 * Ejecutar: node scripts/generate_lina_greeting_audio.mjs
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

// Varias maneras de saludar (sin nombre) para que no suene robotizado
const GREETINGS_ES = [
    "¡Hola! Soy la Profe Lina. ¡Me encantan las mates! En un momento te dejo el ejercicio en la pizarra y empezamos paso a paso. ¡Tú puedes!",
    "¡Hola, hola! Soy Lina, tu profe de matemáticas. En un ratito ponemos el ejercicio en la pizarra y lo resolvemos juntos. ¡Vamos con toda!",
    "¡Qué tal! Aquí la Profe Lina. En un momento te dejo el ejercicio y lo hacemos paso a paso. ¡Confío en ti!",
    "¡Hola! Me encanta verte por aquí. Soy la Profe Lina. En un momento te pongo el ejercicio en la pizarra y empezamos. ¡Tú puedes!",
    "¡Hola, campeón o campeona! Soy Lina. En un ratito te dejo el ejercicio y lo resolvemos juntos. ¡Manos a la obra!",
    "¡Hola! Soy la Profe Lina. ¡Me encantan las matemáticas! En un momento te dejo el ejercicio en la pizarra y lo hacemos paso a paso. ¡Vamos!",
    "¡Qué alegría! Aquí la Profe Lina. En un momento te pongo el ejercicio y empezamos a resolverlo juntos. ¡Tú puedes!",
    "¡Hola! Soy Lina, tu profe de mates. En un ratito te dejo el ejercicio en la pizarra y lo hacemos paso a paso. ¡Vamos con toda!",
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
                    <prosody pitch="+10%" rate="+8%" volume="+15%">
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
            'User-Agent': 'Nova-Schola-Greeting-Script'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.error(`❌ ${filename}: ${res.statusCode} - ${data}`);
                    reject(new Error(`Azure ${res.statusCode}`));
                });
                return;
            }
            const fileStream = fs.createWriteStream(outputPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ ${filename}`);
                resolve();
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
    console.log('🎙️ Generando MP3 de saludos Profe Lina (varias maneras para no sonar robotizado)...\n');
    for (let i = 0; i < GREETINGS_ES.length; i++) {
        const filename = `greeting_${i + 1}.mp3`;
        try {
            await generateAzure(GREETINGS_ES[i], filename);
            await new Promise(r => setTimeout(r, 600));
        } catch (e) {
            console.error(`❌ ${filename}:`, e.message);
        }
    }
    console.log('\n🏁 Listo. Archivos en public/audio/lina/greeting_1.mp3 ... greeting_' + GREETINGS_ES.length + '.mp3');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
