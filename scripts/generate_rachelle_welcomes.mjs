
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

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../public/audio/rachelle');

const WELCOMES = [
    { name: 'welcome_1.mp3', text: "Hello champion! Ready to build amazing stories in English today?" },
    { name: 'welcome_2.mp3', text: "Hi there! I'm so glad you're back. Let's practice our pronunciation together!" },
    { name: 'welcome_3.mp3', text: "Welcome to the English Studio! I've missed our learning sessions. What should we explore first?" },
    { name: 'welcome_4.mp3', text: "Hi! It's Rachelle! I have some exciting new vocabulary for your school subjects today. Ready?" },
    { name: 'welcome_5.mp3', text: "Hello, reporter! Welcome to your news booth. I'm excited to hear your voice again!" }
];

async function generateOpenAI(text, voice, outputPath) {
    if (!OPENAI_API_KEY) {
        throw new Error("Missing OpenAI API Key");
    }

    const data = JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3'
    });

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/audio/speech',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                res.on('data', d => console.error(d.toString()));
                reject(new Error(`OpenAI error ${res.statusCode}`));
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
        req.write(data);
        req.end();
    });
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    for (const item of WELCOMES) {
        const outputPath = path.join(OUTPUT_DIR, item.name);
        try {
            console.log(`🎙️ Generating: ${item.name}...`);
            await generateOpenAI(item.text, 'shimmer', outputPath);
            console.log(`✅ Done: ${item.name}`);
            await new Promise(r => setTimeout(r, 500));
        } catch (e) {
            console.error(`❌ Failed: ${item.name}`, e.message);
        }
    }
}

main();
