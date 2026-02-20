const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'sk_3bfd0ecfb8140d8ee48154837bf48142763a634296d9f5a6';
const VOICE_ID = 'VmejBeYhbrcTPwDniox7'; // Lina
const TEXT = `¡Hola! Qué alegría saludarte. Soy la profe Lina, tu guía en esta gran aventura por Nova Schola. Hoy te mostraré cómo transformamos la educación uniendo lo mejor de dos mundos.

Lo que van a ver no es solo una plataforma educativa. Es un Compañero Empático. Nova Schola no solo sabe qué estudia el niño, sino cómo se siente mientras estudia. Es un circuito seguro que une lo académico con lo emocional.

Imagínate tener todo tu colegio en un solo lugar. Sincronizamos las tareas de Google Classroom y las convertimos en misiones gamificadas. El sistema organiza la agenda automáticamente, reduciendo la ansiedad de mis niños.

Con Nova, las matemáticas dejan de ser un problema. Aquí estoy yo para ayudarte con todo mi cariño, explicándote paso a paso. No soy una máquina fría; analizo la confianza del estudiante y personalizo la explicación para que el aprendizaje sea real y profundo.

Y si hay examen pronto, ¡no hay problema! Nuestro sistema genera tarjetas mágicas para repasar sin estrés. Todo esto, unido a nuestra tienda de premios y salones de progreso, motiva a los niños a superar sus límites.

Y para los papitos, tranquilidad total. Nova genera reportes de bienestar y rendimiento en tiempo real, permitiendo una intervención temprana basada en la emoción y el logro.

Esto es educación del futuro: Académica, Personalizada y Emocional. ¡Bienvenidos a Nova Schola!`;

const data = JSON.stringify({
    text: TEXT,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
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

const outputPath = path.join(__dirname, '../public/audio/presentacion_nova_lina.mp3');
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const req = https.request(options, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Status Code: ${res.statusCode}`);
        res.on('data', d => console.error(d.toString()));
        return;
    }

    const file = fs.createWriteStream(outputPath);
    res.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log(`✅ MP3 generado con éxito: public/audio/presentacion_nova_lina.mp3`);
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
});

req.write(data);
req.end();
