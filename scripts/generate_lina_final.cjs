const fs = require('fs');
const path = require('path');
const https = require('https');

// 🔑 USANDO LA KEY NUEVA DEL .ENV
const ELEVENLABS_API_KEY = 'sk_a6e0e4d6429f4a0ec22c9e6cd5432a9e8ed7aec7e22a39a6';
const VOICE_ID = 'VmejBeYhbrcTPwDniox7'; // Voz de Lina

const FILES = [
    {
        filename: 'tour_part_1.mp3',
        text: "¡Hola! Qué alegría tenerte aquí. Soy la profe Lina. Comencemos nuestro recorrido en el Centro de Mando. Aquí tienes todo tu universo escolar al alcance de un clic. Sincronizamos tu calendario y tus tareas para que nunca pierdas el rumbo. Ahora, prepárate para lo mejor: Nuestra Tutoría de Matemáticas."
    },
    {
        filename: 'tutor_math_1.mp3',
        text: "¡Hola mi niño, hola campeón! Soy Lina. Vamos a sumar estas fracciones. Mira con atención el número de abajo, el Denominador. ¿Qué es lo primero que debemos hacer?"
    },
    {
        filename: 'tour_part_2.mp3',
        text: "¡Viste eso! Bilingüismo real y paso a paso. Pero el viaje continúa. Si tienes examen, nuestras Tarjetas Mágicas se generan automáticamente para que repases en minutos. ¿Curiosidad científica? En el Centro de Investigación aprendes a indagar como un profesional. Todo lo que aprendes se organiza en tu Biblioteca Universal, ¡adiós al desorden! Y para perfeccionar el idioma, visita el Centro de Inglés con Miss Rachelle. ¿El esfuerzo paga? ¡Claro! En la renovada Nova Shop puedes mejorar tu Avatar con las monedas que ganas estudiando. Luego, lleva tu avatar a la Arena Nova, donde cumples misiones para salvar el planeta real. Finalmente, tus padres tienen su propia Torre de Control, para acompañarte segura y felizmente en este viaje. ¡Nova Schola es tu lugar!"
    }
];

async function generateAudio(item) {
    const outputPath = path.join(__dirname, '../public/audio/lina', item.filename);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    console.log(`🎙️ Generando con ElevenLabs (${VOICE_ID}): ${item.filename}...`);

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.elevenlabs.io',
            path: `/v1/text-to-speech/${VOICE_ID}`,
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                console.error(`❌ Error ${res.statusCode} en ${item.filename}`);
                if (res.statusCode === 401) console.error("⚠️ KEY INVÁLIDA O SIN CRÉDITOS.");
                res.resume();
                resolve(false);
                return;
            }

            const fileStream = fs.createWriteStream(outputPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ Guardado: public/audio/lina/${item.filename}`);
                resolve(true);
            });
        });

        req.on('error', (e) => {
            console.error(`Error: ${e.message}`);
            reject(e);
        });

        req.write(JSON.stringify({
            text: item.text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.8,
                style: 0.0,
                use_speaker_boost: true
            }
        }));
        req.end();
    });
}

async function main() {
    console.log("🚀 Iniciando generación de audios con OpenAI (Plan B)...");

    for (const item of FILES) {
        await generateAudio(item);
        // Pequeña pausa para no saturar
        await new Promise(r => setTimeout(r, 500));
    }

    console.log("🏁 Proceso finalizado.");
}

main();
