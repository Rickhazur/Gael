const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to load keys from .env and .env.local
function loadEnv() {
    ['.env', '.env.local'].forEach(file => {
        const envPath = path.join(__dirname, '../', file);
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const [key, ...value] = line.split('=');
                if (key && value.length > 0) {
                    let val = value.join('=').trim();
                    if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
                    if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
                    process.env[key.trim()] = val;
                }
            });
        }
    });
}
loadEnv();

const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY || 'sk_de7907293043780b6725c27df64b31ad92355486db5dea93';
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

console.log("ElevenLabs Key being used (first 5 chars):", ELEVENLABS_API_KEY.substring(0, 5));
console.log("OpenAI Key exists:", !!OPENAI_API_KEY);

const LINA_VOICE_ID = 'VmejBeYhbrcTPwDniox7';
const RACHELLE_VOICE = 'shimmer';

const ASSETS = [
    // LINA NARRATOR
    { name: 'lina/tour_part_1.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: '¡Hola! Qué alegría tenerte aquí. Soy la profe Lina. Comencemos nuestro recorrido en el Centro de Mando. Aquí tienes todo tu universo escolar al alcance de un clic. Sincronizamos tu calendario y tus tareas para que nunca pierdas el rumbo. Ahora, prepárate para lo mejor: Nuestra Tutoría de Matemáticas.' },

    // PART 2 (Plays AFTER the math interaction)
    { name: 'lina/tour_part_2.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: '¡Viste eso! Bilingüismo real y paso a paso. Pero el viaje continúa. Si tienes examen, nuestras Tarjetas Mágicas se generan automáticamente para que repases en minutos. ¿Curiosidad científica? En el Centro de Investigación aprendes a indagar como un profesional. Todo lo que aprendes se organiza en tu Biblioteca Universal, ¡adiós al desorden! Y para perfeccionar el idioma, visita el Centro de Inglés con Miss Rachelle. ¿El esfuerzo paga? ¡Claro! En la renovada Nova Shop puedes mejorar tu Avatar con las monedas que ganas estudiando. Luego, lleva tu avatar a la Arena Nova, donde cumples misiones para salvar el planeta real. Finalmente, tus padres tienen su propia Torre de Control, para acompañarte segura y felizmente en este viaje. ¡Nova Schola es tu lugar!' },

    // PREVIOUS ASSETS (Keep for safety or individual usage)
    { name: 'lina/step_1.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: '¡Hola! Qué alegría saludarte. Soy la profe Lina, tu guía en esta gran aventura por Nova Schola. Hoy te mostraré cómo transformamos la educación uniendo lo mejor de dos mundos. Pero primero, hagamos una sincronización de sistema.' },
    { name: 'lina/step_2.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: 'Este es el corazón de Nova. Imagínate tener todo tu colegio en un solo lugar. Sincronizamos tus tareas de Google Classroom, y también puedes subir fotos de tus tareas. Y, lo mejor de todo, analizamos tus evaluaciones para saber exactamente dónde necesitas un empujoncito. ¡Nada se nos escapa!' },
    { name: 'lina/step_3.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: 'Con Nova, las matemáticas dejan de ser un problema. Tienes un equipo de tutoras de primer nivel a tu disposición. Primero, me escucharás a mí explicándote con cariño en español, y luego a Miss Rachelle reforzando en inglés. ¡Bilingüismo real en acción!' },
    { name: 'lina/step_4.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: '¿Mañana tienes examen? ¡Tranquilo, no te estreses! Nova crea automáticamente tarjetas de repaso con lo que has estudiado. Con solo 5 minutos de estas tarjetas mágicas, vas a recordar todo súper fácil. ¡A sacar ese cien!' },
    { name: 'lina/step_5.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: '¡Ponte el casco de astronauta! Estamos en el Laboratorio Espacial. Aquí investigas de forma segura y divertida. Nova te ayuda a crear reportes increíbles con tus propias ideas, nada de copiar y pegar. ¡Aquí formamos verdaderos científicos!' },
    { name: 'lina/step_6.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: 'Dile adiós al desorden. Aquí tienes tus cuadernos digitales para todas las materias. Todo lo que investigas o escaneas se guarda solito en su lugar. ¡Tener tus ideas organizadas nunca fue tan fácil y bonito!' },
    { name: 'lina/step_7.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: 'Ahora llegamos con Miss Rachelle. Ella es nuestra experta en bilingüismo. Su misión es identificar qué temas se te dificultan y ayudarte a entenderlos en inglés. ¡Así aprendes el idioma usándolo de verdad!' },
    { name: 'lina/step_8.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: '¡Mira todas esas monedas! Pero ojo, aquí no regalamos nada. Cada monedita es fruto de tu esfuerzo académico. Puedes usarlas en la tienda para personalizar tu avatar y mostrarle al mundo todo lo que has logrado. ¡Tú te lo ganaste!' },
    { name: 'lina/step_9.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: 'Este es el Salón de la Fama. Aquí celebramos tus victorias. Ver tus medallas y tu progreso te recuerda lo inteligente y capaz que eres. ¡En Nova no hay imposibles cuando te esfuerzas de corazón!' },
    { name: 'lina/step_10.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: '¡Llegó la hora de entrar en acción! En la Arena Nova, usas lo que aprendes para salvar el planeta. Desde proteger a las abejitas hasta ahorrar energía. ¡Aquí aprendemos para cambiar el mundo de verdad!' },
    { name: 'lina/step_11.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: 'Y por último, la Torre de Control para tus papitos. Ellos pueden ver cómo vas, recibir alertas de tus logros y saber que estás seguro y aprendiendo feliz. ¡Nova une a toda la familia en este viaje increíble!' },

    // LINA TUTOR
    { name: 'lina/tutor_math_1.mp3', voice: LINA_VOICE_ID, provider: 'elevenlabs', text: '¡Hola mi niño, hola campeón! Soy Lina. Vamos a sumar estas fracciones. Mira con atención el número de abajo, el Denominador. ¿Qué es lo primero que debemos hacer?' },

    // RACHELLE
    { name: 'rachelle/step_1.mp3', voice: RACHELLE_VOICE, provider: 'openai', text: "Hello champion! I am Miss Rachelle! Welcome to your brand new digital campus! I am so excited to help you master English while we explore this amazing world together! Let's get started right now!" },
    { name: 'rachelle/tutor_math_1.mp3', voice: RACHELLE_VOICE, provider: 'openai', text: "Exactly! That is absolutely brilliant! We find the Common Denominator. In English, we call it the \"Least Common Multiple\". Now, tell me, what is the next step to solve this? You can do it!" },
    { name: 'rachelle/step_7.mp3', voice: RACHELLE_VOICE, provider: 'openai', text: "Hello again! Wow! I have been checking your progress in Science and Math, and you are doing wonderful work! I noticed we can strengthen your academic vocabulary even more. Let's practice some specific terms to make your grammar perfect while you master these subjects! Are you ready?" }
];

async function generateElevenLabs(text, voiceId, outputPath) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.8,
                style: 0.0,
                use_speaker_boost: true
            }
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`ElevenLabs error ${response.status}: ${JSON.stringify(err)}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
}

async function generateOpenAI(text, voice, outputPath) {
    if (!OPENAI_API_KEY) {
        console.warn(`⚠️ Skipping OpenAI asset ${outputPath} - No API Key`);
        return;
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: voice,
            response_format: 'mp3'
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`OpenAI error ${response.status}: ${JSON.stringify(err)}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
}

async function main() {
    console.log("🚀 Starting Tour Assets Generation...");

    for (const asset of ASSETS) {
        const outputPath = path.join(__dirname, '../public/audio', asset.name);
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        if (fs.existsSync(outputPath)) {
            console.log(`⏩ Skipping existing: ${asset.name}`);
            continue;
        }

        try {
            console.log(`🎙️ Generating: ${asset.name} (${asset.provider})...`);
            if (asset.provider === 'elevenlabs') {
                await generateElevenLabs(asset.text, asset.voice, outputPath);
            } else {
                await generateOpenAI(asset.text, asset.voice, outputPath);
            }
            console.log(`✅ Done: ${asset.name}`);
            // Small delay to avoid rate limits
            await new Promise(r => setTimeout(r, 500));
        } catch (e) {
            console.error(`❌ Failed: ${asset.name}`, e.message);
        }
    }

    console.log("🏁 Asset generation complete.");
}

main();
