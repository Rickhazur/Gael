import fs from 'fs';
import path from 'path';
import https from 'https';

const API_KEY = 'sk_5004b415ed22a0d34b997f9ec6be607c172d05f03bb7e5bb';
const VOICE_ID = 'VmejBeYhbrcTPwDniox7';
const OUTPUT_DIR = './public/audio';

// EXACT FILENAMES EXPECTED BY THE TOUR
const SCRIPTS = {
    "presentacion_nova_lina.mp3": "¡Hola! Qué alegría tenerte aquí. Soy la profe Lina. Comencemos nuestro recorrido en el Centro de Mando. Aquí tienes todo tu universo escolar al alcance de un clic. Sincronizamos tu calendario, tus tareas de Google Classroom, y hasta puedes subir fotos de tus tareas. ¡Para que nunca pierdas el rumbo! Ahora, prepárate para lo mejor: Nuestra Tutoría de Matemáticas. Pero el viaje continúa. Si tienes examen mañana, nuestras Tarjetas Mágicas se generan automáticamente para que repases en minutos y sin estrés. Bienvenido a nuestro centro de información en donde aprenderemos a investigar. Aquí aprenderás a crear con tus propias ideas, ¡nada de copiar y pegar! And welcome to our research center where we learn how to discover wonderful things. Dile adiós al desorden. Aquí tienes tus cuadernos digitales para todas las materias. Todo lo que aprendes se organiza en tu Biblioteca Universal, ¡atención al orden! Y si quieres perfeccionar el idioma, visita el Centro de Inglés con Miss Rachelle, quien detecta tus debilidades para ayudarte a mejorar. ¿El esfuerzo paga? ¡Claro que sí! En la renovada Nova Shop puedes mejorar tu Avatar con las monedas que ganas estudiando. Luego, lleva tu avatar a la Arena Nova, donde cumples misiones para salvar el planeta real. Finalmente, tus padres tienen su propia Torre de Control, para acompañarte segura y felizmente en este viaje. ¡Nova Schola es tu lugar! ¡Bienvenidos al futuro de la educación!",
    "interaccion_math.mp3": "Rachel y yo explicamos matemáticas buscando el Mínimo Común Múltiplo."
};

async function generate(text, filename) {
    const filePath = path.join(OUTPUT_DIR, filename);
    console.log(`🎙️ Generando (Alta Calidad): ${filename}...`);

    const data = JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.05,
            use_speaker_boost: true
        }
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
                console.error(`❌ Error ${res.statusCode} en ${filename}`);
                resolve(false);
                return;
            }
            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ ¡ÉXITO! ${filename} generado (${fs.statSync(filePath).size} bytes).`);
                resolve(true);
            });
        });
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log("🚀 INICIANDO GRABACIÓN LINA TOUR FINAL...");
    for (const [file, text] of Object.entries(SCRIPTS)) {
        await generate(text, file);
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log("✨ Proceso completado.");
}

main();
