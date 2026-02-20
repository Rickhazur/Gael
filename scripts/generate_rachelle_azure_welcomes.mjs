
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const AZURE_KEY = process.env.VITE_AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.VITE_AZURE_REGION;
const OUTPUT_DIR = path.join(__dirname, '../public/audio/rachelle');

const WELCOMES = [
    { name: 'welcome_1.mp3', text: "Hello champion! Ready to build amazing stories in English today?" },
    { name: 'welcome_2.mp3', text: "Hi there! I'm so glad you're back. Let's practice our pronunciation together!" },
    { name: 'welcome_3.mp3', text: "Welcome to the English Studio! I've missed our learning sessions. What should we explore first?" },
    { name: 'welcome_4.mp3', text: "Hi! It's Rachelle! I have some exciting new vocabulary for your school subjects today. Ready?" },
    { name: 'welcome_5.mp3', text: "Hello, reporter! Welcome to your news booth. I'm excited to hear your voice again!" }
];

const VOICE_NAME = 'en-US-JennyNeural';

async function generateAzure(text, filename) {
    if (!AZURE_KEY || !AZURE_REGION) {
        throw new Error("Missing Azure Credentials");
    }

    const outputPath = path.join(OUTPUT_DIR, filename);

    // Jenny supports 'cheerful'
    const ssml = `
        <speak version='1.0' xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang='en-US'>
            <voice name='${VOICE_NAME}'>
                <mstts:express-as style="cheerful">
                    <prosody pitch="+12%" rate="+5%" volume="+10%">
                        ${text}
                    </prosody>
                </mstts:express-as>
            </voice>
        </speak>`;

    const options = {
        hostname: `${AZURE_REGION}.tts.speech.microsoft.com`,
        path: '/cognitiveservices/v1',
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': AZURE_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
            'User-Agent': 'Nova-Schola-Script'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.error(`Azure error ${res.statusCode}: ${data}`);
                    reject(new Error(`Azure error ${res.statusCode}`));
                });
                return;
            }
            const fileStream = fs.createWriteStream(outputPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        });
        req.on('error', reject);
        req.write(ssml);
        req.end();
    });
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log("🚀 Starting Azure Rachelle Welcome Generation...");
    for (const item of WELCOMES) {
        try {
            console.log(`🎙️ Generating (Azure): ${item.name} -> "${item.text}"`);
            await generateAzure(item.text, item.name);
            console.log(`✅ Success: ${item.name}`);
            await new Promise(r => setTimeout(r, 1000)); // Delay to be safe
        } catch (e) {
            console.error(`❌ Failed: ${item.name}`, e.message);
        }
    }
    console.log("🏁 All Rachelle welcomes generated.");
}

main();
