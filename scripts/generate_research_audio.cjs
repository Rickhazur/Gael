const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'sk_5004b415ed22a0d34b997f9ec6be607c172d05f03bb7e5bb';
const VOICE_ID = 'VmejBeYhbrcTPwDniox7'; // Lina - La misma voz de la presentadora

const TEXT = `¡Bienvenido al laboratorio de investigación! Aquí te enseñamos a crear reportes con tus propias ideas. Nada de copiar y pegar. En Nova aprendemos a investigar, a pensar, y a escribir como verdaderos científicos. ¡Vamos a descubrir el mundo juntos!`;

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

const outputPath = path.join(__dirname, '../public/audio/interaccion_research.mp3');
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

console.log('🎙️ Generando audio de Research Center con voz de Lina (ElevenLabs)...');

const req = https.request(options, (res) => {
    if (res.statusCode !== 200) {
        console.error(`❌ Error - Status Code: ${res.statusCode}`);
        res.on('data', d => console.error(d.toString()));
        return;
    }

    const file = fs.createWriteStream(outputPath);
    res.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log(`✅ MP3 generado con éxito: public/audio/interaccion_research.mp3`);
    });
});

req.on('error', (e) => {
    console.error(`❌ Error de red: ${e.message}`);
});

req.write(data);
req.end();
