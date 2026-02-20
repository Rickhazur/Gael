import fs from 'fs';
import path from 'path';
import https from 'https';

const OUTPUT_DIR = './public/audio';
const VOICE_ID = 'VmejBeYhbrcTPwDniox7';
const API_KEY = 'e2460b239a3a9622ba4a69a7d8dc613f2ee636f3f81e46632f9d0a63cea5943f';

async function generateSingleAudio() {
    const text = "¡Excelente! ¡Muy bien resuelto!";
    const filename = "test_feedback_excellent.mp3";
    const filePath = path.join(OUTPUT_DIR, filename);

    console.log(`🎙️  Generating: ${filename} -> "${text}"`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
    console.log(`🎤 Voice ID: ${VOICE_ID}`);

    const data = JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
        }
    });

    console.log(`📦 Request body:`, data);

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

    console.log(`🌐 Request URL: https://${options.hostname}${options.path}`);

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`📡 Status Code: ${res.statusCode}`);
            console.log(`📋 Headers:`, JSON.stringify(res.headers, null, 2));

            if (res.statusCode !== 200) {
                console.error(`❌ API Error ${res.statusCode} for ${filename}`);
                let errorData = '';
                res.on('data', d => {
                    errorData += d.toString();
                });
                res.on('end', () => {
                    console.error('❌ Full error response:', errorData);
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

        req.on('error', (error) => {
            console.error(`❌ Request Error:`, error);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

generateSingleAudio();
