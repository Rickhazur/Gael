
import fs from 'fs';
import path from 'path';
import https from 'https';

// --- CONFIGURATION ---
const AZURE_KEY = process.env.VITE_AZURE_SPEECH_KEY || '';
const AZURE_REGION = 'eastus';
const LINA_VOICE = 'es-CO-SalomeNeural';
const OUTPUT_DIR = 'C:/Users/devel/OneDrive/Desktop/Nova-Schola-Elementary-main/public/audio/lina';

async function generateAzureAudio(text, filename) {
    const filePath = path.join(OUTPUT_DIR, filename);

    // Escape special characters for SSML
    const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const ssml = `
<speak version='1.0' xml:lang='es-CO'>
    <voice xml:lang='es-CO' xml:gender='Female' name='${LINA_VOICE}'>
        ${escapedText}
    </voice>
</speak>`;

    const options = {
        hostname: `${AZURE_REGION}.tts.speech.microsoft.com`,
        path: '/cognitiveservices/v1',
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': AZURE_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'NovaScholaTutor'
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`❌ Error generating ${filename}: ${res.statusCode}`);
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    console.error(`   Response: ${body}`);
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
        req.on('error', (e) => {
            console.error(`❌ Request Error for ${filename}:`, e);
            resolve(false);
        });
        req.write(ssml);
        req.end();
    });
}

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass if needed for local proxy
    console.log("🚀 Running Azure test for Salomé...");
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    await generateAzureAudio("¡Hola! Soy Salomé.", "test_azure.mp3");
}

main();
