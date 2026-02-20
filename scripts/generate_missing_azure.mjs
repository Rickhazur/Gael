/**
 * Genera MP3 adicionales para Lina (frases 5° grado, intros, etc.).
 * Uso: node scripts/generate_missing_azure.mjs
 * Requiere: VITE_AZURE_SPEECH_KEY y VITE_AZURE_REGION en .env (nunca subas la clave al repo).
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
const LINA_VOICE = 'es-CO-SalomeNeural';
const OUTPUT_DIR = path.join(ROOT, 'public', 'audio', 'lina');

const NEW_PHRASES = {
    "arena_limpieza_oceanos.mp3": "¡Hola, explorador! En el arrecife hay plásticos mezclados con corales y peces. Tu misión es usar fracciones para contar qué parte del total son residuos. Así sabremos cuánto limpiar. ¡Vamos a salvar el océano juntos!",
    "math_welcome_5.mp3": "¡Hola! Bienvenido al reto de quinto grado. Aquí las cosas se ponen interesantes: números más grandes, retos más complejos, ¡pero yo sé que tú eres un genio! ¿Qué vamos a conquistar hoy?",
    "math_welcome_gen.mp3": "¡Hola, campeón! Soy la profe Lina. Estoy lista para que resolvamos cualquier reto matemático juntos. Ponlo en la pizarra y ¡manos a la obra!",
    "math_intro_word_prob.mp3": "¡Hola! Estos problemas de la vida real son mis favoritos. Vamos a leerlo juntos con mucha atención para entender qué nos preguntan. ¿Qué datos ves?",
    "math_intro_geometry.mp3": "¡Hola! Hoy vamos a explorar las formas y sus medidas. Mira el dibujo en la pizarra, ¡las matemáticas también tienen arte!",
    "math_intro_area.mp3": "¡Hola! Vamos a calcular el área, que es el espacio que ocupa una figura por dentro. ¿Recuerdas la fórmula que debemos usar?",
    "math_intro_volumen.mp3": "¡Hola! Vamos a calcular el volumen. Imagina que estamos llenando una caja; necesitamos saber el largo, el ancho y la altura.",
    "math_intro_measurement.mp3": "¡Hola! Vamos a medir el mundo. Recuerda que para comparar medidas, todas deben estar en la misma unidad. ¿Por dónde empezamos?",
    "math_intro_large_nums.mp3": "¡Hola! Vamos a trabajar con números grandes. Recuerda que la posición de cada cifra nos dice cuánto vale de verdad. ¡Miremos bien esas unidades de mil!",
    "genio.mp3": "¡Eres un genio en potencia! Tu razonamiento es impecable.",
    "tip_pasos.mp3": "Recuerda, en matemáticas el orden de los pasos es el secreto del éxito. ¡No te saltes ninguno!"
};

async function generateAzureAudio(text, filename) {
    const filePath = path.join(OUTPUT_DIR, filename);
    const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const ssml = `<speak version='1.0' xml:lang='es-CO'><voice xml:lang='es-CO' xml:gender='Female' name='${LINA_VOICE}'><prosody rate="0.95" pitch="2%">${escapedText}</prosody></voice></speak>`;

    const options = {
        hostname: `${AZURE_REGION}.tts.speech.microsoft.com`,
        path: '/cognitiveservices/v1',
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': AZURE_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'Node'
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`❌ Error ${filename}: ${res.statusCode}`);
                let body = '';
                res.on('data', d => body += d);
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
                console.log(`✅ Saved: ${filename}`);
                resolve(true);
            });
        });
        req.on('error', (e) => resolve(false));
        req.write(ssml);
        req.end();
    });
}

async function main() {
    if (!AZURE_KEY || !AZURE_REGION) {
        console.error("Faltan VITE_AZURE_SPEECH_KEY y VITE_AZURE_REGION en .env");
        process.exit(1);
    }
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log("🚀 Generating NEW 5th Grade Phrases...");
    for (const [filename, text] of Object.entries(NEW_PHRASES)) {
        await generateAzureAudio(text, filename);
    }
    console.log("🏁 Done.");
}

main();
