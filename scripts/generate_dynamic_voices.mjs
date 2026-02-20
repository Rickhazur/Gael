import fs from 'fs';
import path from 'path';
import https from 'https';

const API_KEY = 'sk_5004b415ed22a0d34b997f9ec6be607c172d05f03bb7e5bb';
const VOICE_ID = 'VmejBeYhbrcTPwDniox7';
const OUTPUT_DIR = './public/audio/lina';

const SCRIPTS = {
    // VARIACIONES CUADERNO
    "cuaderno_v1.mp3": "¡Hola, hola! Antes de empezar, corre por tu cuaderno de matemáticas y un lápiz. ¡Te espero!",
    "cuaderno_v2.mp3": "¿Listo para el reto? Primero saca tu cuaderno de mate para que anotes todo. ¡Vamos!",
    "cuaderno_v3.mp3": "¡Oye, campeón! Busca tu cuaderno de matemáticas. Es muy importante escribir para aprender mejor.",
    "cuaderno_v4.mp3": "Antes de que despeguemos, asegúrate de tener tu cuaderno de mate a la mano. ¿Ya lo tienes?",
    "cuaderno_v5.mp3": "¡Qué alegría! Saca tu cuaderno de matemáticas y prepárate para brillar. ¡Dime cuando estés listo!",

    // VARIACIONES CERO MÁGICO
    "cero_v1.mp3": "¡Excelente! Ahora vamos con el segundo número. Como está en las decenas, ponemos este cero mágico al final para que todo esté en su lugar.",
    "cero_v2.mp3": "¡Cuidado aquí! Este número vive en la casa de las decenas, por eso empezamos la nueva fila con un cero. ¡Así somos más ordenados!",
    "cero_v3.mp3": "¡Muy bien! Ponemos un cero abajo antes de multiplicar la segunda cifra porque estamos trabajando con decenas ahora.",
    "cero_v4.mp3": "REGLA MÁGICA: Ponemos un cero a la derecha en esta fila. ¿Por qué? ¡Porque el número de abajo es una decena! Vamos a seguir.",
    "cero_v5.mp3": "¡Perfecto! Al pasar al segundo número, dejamos este espacio con un cero. Recuerda que las decenas siempre van un pasito adelante.",

    // VARIACIONES DETECTIVE (WORD PROBLEMS)
    "detective_v1.mp3": "¡Un misterio detectado! Soy la Detective Lina. Vamos a leer el problema para encontrar la pista clave. ¿Qué es lo que nos preguntan exactamente?",
    "detective_v2.mp3": "¡Misión de razonamiento activa! Antes de usar los números, cuéntame: ¿De qué trata esta historia matemática?",
    "detective_v3.mp3": "¡Me encantan los acertijos! Vamos a ser detectives. Paso uno: ¿Qué es lo que queremos descubrir hoy?",
    "detective_v4.mp3": "Ponte tu lupa de detective. Vamos a buscar los datos importantes del problema antes de resolverlo. ¿Qué números ves por ahí?",
    "detective_v5.mp3": "¡Hora de pensar, detective! Leamos el problema con mucha calma. ¿Quiénes o qué cosas son los protagonistas de este misterio?",

    // VARIACIONES GEOMETRÍA (GEOMETRY VERSE)
    "geometry_v1.mp3": "¡Bienvenido al Geometría-Verso! 📐 He activado mi Visión Mágica para ver el mundo con formas. ¿Qué figura quieres investigar hoy?",
    "geometry_v2.mp3": "¡Mira a tu alrededor! Todo tiene una forma especial. 🎨 Vamos a descubrir los secretos de la geometría. ¿Por cuál figura empezamos?",
    "geometry_v3.mp3": "¡Qué emoción! La geometría es como el dibujo, pero con reglas mágicas. 💎 ¿Estás listo para convertirte en un arquitecto de figuras?",
    "geometry_v4.mp3": "¡Visión Mágica activada! 🕵️‍♀️ Veo círculos, cuadrados y triángulos por todas partes. ¿Quieres que analicemos uno juntos?",
    "geometry_v5.mp3": "¡Hola, artista de las formas! Hoy vamos a aprender que las matemáticas también se pueden dibujar. 📐 ¿Qué misterio geométrico resolveremos?"
};

async function generate(text, filename) {
    const filePath = path.join(OUTPUT_DIR, filename);
    console.log(`🎙️ Grabando variacion: ${filename}...`);

    const data = JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.1,
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
                console.log(`✅ ${filename} grabado con éxito.`);
                resolve(true);
            });
        });
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log("🚀 INICIANDO GRABACIÓN DE 10 VARIACIONES DINÁMICAS...");
    for (const [file, text] of Object.entries(SCRIPTS)) {
        await generate(text, file);
        // Pequeña pausa para no saturar la API
        await new Promise(r => setTimeout(r, 800));
    }
    console.log("✨ ¡Todas las voces de Lina han sido actualizadas!");
}

main();
