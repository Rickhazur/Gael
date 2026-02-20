
import fs from 'fs';
import path from 'path';
import https from 'https';

// --- CONFIGURATION ---
const OUTPUT_DIR = './public/audio';
const ENV_FILE = '.env';

// FORCE LINA VOICE (Colombian / Latin American)
// Replace this with your preferred Voice ID if different
const VOICE_ID = 'VmejBeYhbrcTPwDniox7';

// --- PHRASES TO GENERATE (SAME AS TUTORCHAT) ---
const ALIASES = {
    // 1. INTRODUCTIONS
    "intro_percentages.mp3": "Hola. Hoy vamos a aprender porcentajes paso a paso. Dime, ¿qué porcentaje quieres trabajar?",
    "intro_geometry.mp3": "Hola. Hoy vamos a aprender geometría de quinto grado paso a paso. Dime, ¿qué tema quieres estudiar?",
    "intro_conversions.mp3": "Hola. Hoy vamos a aprender a convertir decimales y fracciones paso a paso. ¿Qué número quieres convertir hoy?",

    // 2. FEEDBACK (CRITICAL)
    "feedback_excellent.mp3": "¡Excelente! ¡Muy bien resuelto!",
    "feedback_correct.mp3": "¡Correcto! ¡Muy bien!",
    "feedback_try_again.mp3": "Hmm, no exactamente. Inténtalo de nuevo.",
    "feedback_very_close.mp3": "Muy cerca. Revisa de nuevo.",
    "feedback_almost.mp3": "Hmm, casi. Intentemos de nuevo.",
    "check_calculation.mp3": "Revisa el cálculo.",

    // 3. PERCENTAGES
    "tip_50_percent.mp3": "Tip: Cincuenta por ciento es la mitad.",
    "tip_25_percent.mp3": "Tip: Veinticinco por ciento es un cuarto.",
    "tip_10_percent.mp3": "Tip: Diez por ciento es mover el punto decimal un lugar.",
    "rule_percent_mult.mp3": "Recuerda, porcentaje es multiplicación.",
    "percentage_concept.mp3": "El porcentaje siempre busca su total.",

    // 4. FRACTIONS
    "fraction_homogeneous_rule.mp3": "Mismo denominador. Sumamos o restamos numeradores.",
    "fraction_heterogeneous_rule.mp3": "Denominadores diferentes. Buscamos común denominador.",
    "fraction_check_multiples.mp3": "Revisa los múltiplos.",

    // 5. ADDITION / PLACE VALUE
    "addition_units_correction.mp3": "Casi. Recuerda: las unidades siempre están a la derecha. Unidades, decenas, centenas. ¿Dónde están las unidades?",
    "addition_units_ask.mp3": "Primero dime, ¿en dónde están las unidades?",

    // 6. WORD PROBLEMS
    "word_problem_sum.mp3": "Problema de texto. Operación: Suma.",
    "word_problem_sub.mp3": "Problema de texto. Operación: Resta.",
    "word_problem_mult.mp3": "Problema de texto. Operación: Multiplicación.",
    "word_problem_div.mp3": "Problema de texto. Operación: División.",
    "word_problem_reread.mp3": "Relee el problema y busca las palabras clave.",

    // 7. GENERIC PROMPTS
    "prompt_what_result.mp3": "¿Cuál es el resultado?",
    "prompt_check_sense.mp3": "¿Tiene sentido el resultado?",
    "prompt_step_by_step.mp3": "Vamos paso a paso."
};

// --- API KEY EXTRACTION ---
function getApiKey() {
    try {
        const content = fs.readFileSync(ENV_FILE, 'utf-8');
        const match = content.match(/VITE_ELEVENLABS_API_KEY=(.*)/);
        if (match && match[1]) {
            return match[1].trim().replace(/["']/g, ''); // Remove quotes if present
        }
    } catch (e) {
        console.error("Error reading .env file:", e.message);
    }
    return null;
}

// --- GENERATOR FUNCTION ---
async function generateAudio(text, filename, apiKey) {
    const filePath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping (Exists): ${filename}`);
        return;
    }

    console.log(`🎙️  Generating: ${filename} -> "${text}"`);

    const data = JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
        }
    });

    const options = {
        hostname: 'api.elevenlabs.io',
        path: `/v1/text-to-speech/${VOICE_ID}`,
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`❌ API Error ${res.statusCode} for ${filename}`);
                res.on('data', d => process.stderr.write(d));
                resolve(false);
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

        req.on('error', (error) => {
            console.error(`❌ Request Error: ${error}`);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

// --- MAIN ---
async function main() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("❌ CRITICAL: Could not find VITE_ELEVENLABS_API_KEY in .env file.");
        console.error("Please ensure your .env file exists and has this key.");
        process.exit(1);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log("📂 Created directory: " + OUTPUT_DIR);
    }

    console.log(`🚀 Starting Batch Audio Generation for ${Object.keys(ALIASES).length} phrases...`);
    console.log(`🔑 Using API Key: ${apiKey.substring(0, 5)}...`);
    console.log("---------------------------------------------------");

    for (const [filename, text] of Object.entries(ALIASES)) {
        await generateAudio(text, filename, apiKey);
        // Add specific delay to avoid Rate Limits (important for ElevenLabs free/starter tiers)
        await new Promise(r => setTimeout(r, 500));
    }

    console.log("---------------------------------------------------");
    console.log("🎉 All Done! Audio files are in /public/audio/");
}

main();
