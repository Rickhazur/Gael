
import fs from 'fs';
import path from 'path';
import https from 'https';

// --- CONFIGURATION ---
const AZURE_KEY = process.env.VITE_AZURE_SPEECH_KEY || '';
const AZURE_REGION = 'eastus';
const NOVA_VOICE = 'es-MX-DaliaNeural';
const LINA_VOICE = 'es-CO-SalomeNeural';
const RACHELLE_VOICE = 'en-US-JennyNeural';
const GUARDIAN_VOICE = 'en-US-GuyNeural'; // Deep robot
const OUTPUT_DIR = 'C:/Users/devel/OneDrive/Desktop/Nova-Schola-Elementary-main/public/audio/tour';

// --- FULL TOUR SCRIPTS (Nova High Energy) ---
const ASSETS = [
    { id: 0, name: 'nova_s0_account.mp3', text: 'Antes de empezar el recorrido, te explico cómo crear tu cuenta. Si eres padre, ve a la pantalla de inicio y haz clic en Iniciar Sesión. Luego pulsa Crear cuenta. Elige Padres para crear tu cuenta y la de tu hijo en un solo paso. Completa el formulario con tus datos y los de tu hijo. ¡Listo! Recibirás un correo cuando las cuentas estén aprobadas. Si eres estudiante, elige la opción Estudiante. ¿Continuamos con el recorrido?', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 1, name: 'nova_s1_welcome.mp3', text: '¡¡Hola!! ¡Qué alegría tenerte aquí! Soy Nova, tu asistente de aprendizaje inteligente. ¡Prepárate para una aventura inolvidable con la app del siglo 21! ¿Listo para despegar?', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 2, name: 'nova_s2_commander.mp3', text: '¡Comencemos en el Centro de Mando! Aquí tienes tus misiones, como esta de fracciones. Haz clic en la misión y te lleva directamente a la tutoría de matemáticas para que la profesora te explique. Después puedes guardarla en tu cuaderno. Es muy importante la sección de evaluación: sube tu evaluación o toma una foto y Nova la guarda, creando misiones personalizadas para mejorar tu rendimiento. ¡Sincronizamos tu Google Classroom para que nunca pierdas el rumbo!', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 3, name: 'nova_s3_math_intro.mp3', text: 'Ahora, ¡prepárate para la magia: Nuestra Tutoría de Matemáticas bilingüe con la profe Lina y Miss Rachelle! Mira cómo el bilingüismo real y la socrática te ayudan a descubrir la solución por ti mismo.', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 4, name: 'nova_s4_flashcards.mp3', text: '¡Viste ese razonamiento! Pero el viaje continúa... ¡Mira! Nuestras Tarjetas Mágicas se generan automáticamente para que repases en segundos. ¡Adiós al estrés de los exámenes!', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 5, name: 'nova_s5_bilingual.mp3', text: '¡Y ahora, bienvenidos a nuestro Centro de Investigación! No es solo para ciencias: sirve para todas las materias: matemáticas, sociales, lengua y más. Aquí puedes investigar y crear reportes increíbles tanto en español como en inglés. ¡Aprenderás a investigar y escribir como todo un profesional!', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 6, name: 'nova_s6_library.mp3', text: '¡Impresionante! Mira tu cuaderno de matemáticas con la explicación y los tips del tutor. Todo tu conocimiento se organiza aquí en tu Biblioteca Universal. ¡Dile adiós al desorden para siempre!', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 12, name: 'nova_s2_missions.mp3', text: '¡Vuelve al Centro de Mando! Aquí se crea una misión de investigación. Haz clic en la misión y te lleva al Centro de Investigación. ¡El niño hace su investigación, la guarda y se crea su cuaderno de ciencias con las tarjetas de estudio!', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 13, name: 'nova_s6_science.mp3', text: '¡Mira! Se guardó lo que hizo el niño. Aquí está su cuaderno de ciencias con la investigación. ¡Y se crearon las tarjetas de estudio para repasar! ¡Todo conectado!', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 7, name: 'nova_s7_english.mp3', text: 'Y para dominar el mundo bilingüe, visita el Centro de Inglés con Miss Rachelle. Ella detecta tus debilidades y te ayuda a brillar con un vocabulario académico perfecto.', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 8, name: 'nova_s8_shop.mp3', text: '¿El esfuerzo paga? ¡Claro que sí! En la Nova Shop puedes mejorar tu Avatar con las monedas que ganas estudiando. ¡Tú te lo ganaste con tu esfuerzo!', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 9, name: 'nova_s9_arena.mp3', text: '¡Genial! Ahora lleva tu avatar a la Arena Nova. Aquí, tu progreso académico se convierte en misiones para salvar el planeta real. ¡Jugar con un propósito!', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 10, name: 'nova_s10_parents.mp3', text: 'Finalmente, tus padres tienen su propia Torre de Control. Reciben reportes inteligentes y celebran cada uno de tus logros en este viaje seguro y feliz.', voice: NOVA_VOICE, style: 'cheerful' },
    { id: 11, name: 'nova_s11_final.mp3', text: '¡Nova Skola ya es tu hogar! Bienvenidos al futuro de la educación. ¡Es hora de descubrir todo tu potencial infinito! ¡Nos vemos en clase!', voice: NOVA_VOICE, style: 'cheerful' }
];

async function generateAzureAudio(asset) {
    const filePath = path.join(OUTPUT_DIR, asset.name);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const isEnglish = asset.voice.startsWith('en-US');
    const isMexican = asset.voice.startsWith('es-MX');
    const lang = isEnglish ? 'en-US' : (isMexican ? 'es-MX' : 'es-CO');

    const escapedText = asset.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const pitch = asset.pitch || '+6%';
    const rate = asset.rate || '+2%';

    const ssml = `
<speak version='1.0' xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang='${lang}'>
    <voice name='${asset.voice}'>
        <mstts:express-as style="${asset.style}">
            <prosody pitch="${pitch}" rate="${rate}" volume="+10%">
                ${escapedText}
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
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'Node'
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`❌ Error ${asset.name}: ${res.statusCode}`);
                resolve(false);
                return;
            }
            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✨ Recorded Tour Asset: ${asset.name}`);
                resolve(true);
            });
        });
        req.on('error', (e) => {
            console.error(e);
            resolve(false);
        });
        req.write(ssml);
        req.end();
    });
}

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log("🚀 GENERATING PRECISION TOUR ASSETS (Step-by-Step)...");

    for (const asset of ASSETS) {
        await generateAzureAudio(asset);
    }

    console.log("🏁 PRECISION ASSETS READY! ✨");
}

main();
