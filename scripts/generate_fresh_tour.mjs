import fs from 'fs';
import path from 'path';
import https from 'https';

const API_KEY = 'sk_3bfd0ecfb8140d8ee48154837bf48142763a634296d9f5a6';
const VOICE_ID = 'VmejBeYhbrcTPwDniox7';
const OUTPUT_DIR = './public/audio';

async function generate(text, filename) {
    const filePath = path.join(OUTPUT_DIR, filename);
    console.log(`🎙️ Generating: ${filename}...`);

    const data = JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8 }
    });

    const options = {
        hostname: 'api.elevenlabs.io',
        path: `/v1/text-to-speech/${VOICE_ID}`,
        method: 'POST',
        headers: {
            'xi-api-key': API_KEY,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`❌ Error ${res.statusCode} for ${filename}`);
                resolve(false);
                return;
            }
            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ Success: ${filename} (${fs.statSync(filePath).size} bytes)`);
                resolve(true);
            });
        });
        req.write(data);
        req.end();
    });
}

async function run() {
    // GENERATE THE MASTER TRACK
    const text = "¡Hola! Qué alegría tenerte aquí. Soy la profe Lina. Comencemos nuestro recorrido en el Centro de Mando. Aquí tienes todo tu universo escolar al alcance de un clic. Sincronizamos tu calendario y tus tareas de Google Classroom para que nunca pierdas el rumbo. Ahora, prepárate para lo mejor: Nuestra Tutoría de Matemáticas. (pausa) ¡Viste eso! Bilingüismo real y explicación paso a paso. Pero el viaje continúa. Si tienes examen mañana, nuestras Tarjetas Mágicas se generan automáticamente para que repases en minutos y sin estrés. ¿Tienes curiosidad científica? En el Centro de Investigación aprendes a indagar como un profesional, creando reportes con tus propias ideas. Todo lo que aprendes se organiza en tu Biblioteca Universal, ¡adiós al desorden! Y si quieres perfeccionar el idioma, visita el Centro de Inglés con Miss Rachelle, quien detecta tus debilidades para ayudarte a mejorar. ¿El esfuerzo paga? ¡Claro que sí! En la renovada Nova Shop puedes mejorar tu Avatar con las monedas que ganas estudiando. Luego, lleva tu avatar a la Arena Nova, donde cumples misiones para salvar el planeta real. Finalmente, tus padres tienen su propia Torre de Control, para acompañarte segura y felizmente en este viaje. ¡Nova Schola es tu lugar! ¡Bienvenidos al futuro de la educación!";
    await generate(text, "lina_master_v3.mp3");

    // GENERATE THE INTERACTION
    const interactionText = "¡Hola mi niño, hola campeón! Soy Lina. Vamos a sumar estas fracciones. Mira con atención el número de abajo, el Denominador. ¿Qué es lo primero que debemos hacer?";
    await generate(interactionText, "lina_math_interaction_v3.mp3");
}

run();
