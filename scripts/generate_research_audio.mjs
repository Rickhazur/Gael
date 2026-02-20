
import fs from 'fs';
import path from 'path';
import https from 'https';

const API_KEY = 'sk_5004b415ed22a0d34b997f9ec6be607c172d05f03bb7e5bb';
const VOICE_ID = 'VmejBeYhbrcTPwDniox7'; // Lina's Voice (Colombian)
const OUTPUT_DIR = './public/audio/lina';

const TEXT = "¡Bienvenido al laboratorio de investigación! Aquí te enseñamos a crear reportes con tus propias ideas. Nada de copiar y pegar. En Nova aprendemos a investigar, a pensar, y a escribir como verdaderos científicos. ¡Vamos a descubrir el mundo juntos!";
const FILENAME = 'research_center_interaction.mp3';

async function generate() {
    // Ensure directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const filePath = path.join(OUTPUT_DIR, FILENAME);
    console.log(`🎙️ Generating Lina Audio: ${FILENAME}...`);

    const data = JSON.stringify({
        text: TEXT,
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

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`❌ Error ${res.statusCode}`);
                res.on('data', d => process.stdout.write(d));
                resolve(false);
                return;
            }
            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ Success! Saved to ${filePath}`);
                resolve(true);
            });
        });
        req.on('error', (e) => {
            console.error(e);
            reject(e);
        });
        req.write(data);
        req.end();
    });
}

generate();
