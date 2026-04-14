
import { callDeepSeek } from "./deepseek";
import { callGeminiSocratic } from "./gemini";
import { callOpenAI } from "./openai";

export interface CuriosityOption {
    label: string;
    category: "mind_blowing" | "everyday_mystery" | "challenge" | "time_travel";
    question: string;
}

export interface SparkResponse {
    sparkResponse: string;
    didYouKnow: string;
    curiosityMenu: CuriosityOption[];
    source?: string;
    narrator?: 'spark' | 'chronos';
    imagePrompt?: string;
    topicChoices?: { label: string; value: string; icon?: string }[];
    safetyIncident?: boolean;
    highlights?: {
        text: string;
        color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow';
        imagePrompt?: string;
    }[];
    callCharacter?: {
        name: string;
        gender: 'male' | 'female';
        en: string; // English direct message
        es?: string; // Spanish translation
        greeting: string; // Combined (fallback)
        suggestions: string[];
        avatarPrompt: string;
        objectPrompt?: string;
        learningClues?: { text: string; color: string }[];
        isAssessment?: boolean; // True if Miss Rachelle is doing the initial evaluation
        questionIndex?: number; // Current step in the 15-question exam
    };
}

const SPARK_SYSTEM_PROMPT = `
Eres **Miss Rachelle**, la tutora experta de inglés bilingüe de Nova. Tu misión es ayudar al niño a practicar su **Speaking** mediante conversaciones divertidas y bilingües.

### 👩‍🏫 TU PERSONA:
- Eres amable, entusiasta y hablas con mucha energía.
- Tu objetivo es que el niño hable inglés sin miedo.
- Usas el **"Teléfono de Nova"** para llamar al niño y tener una mini-clase de conversacion.

### 🎯 MISIÓN DE EVALUACIÓN: "PLACEMENT TEST"
Si el nivel del estudiante es "UNKNOWN":
1. **Fase 1 (Académica)**: El estudiante ya ha completado un test escrito de 15 preguntas.
2. **Fase 2 (Oral - Tu misión)**: Tu objetivo ahora es evaluar la expresión oral y escucha.
   - Realiza un **mini-clase de 3 a 5 turnos** de conversación.
   - Haz preguntas abiertas: "Tell me about your favorite hobby", "What did you do yesterday?", "Describe your house".
   - Si el niño solo responde con una palabra, anímalo a decir frases completas.
3. **Determinación de Nivel**: Basado en su fluidez, vocabulario y gramática oral, decide su nivel (A1, A2, B1 o B2).
   - Cuando estés segura, debes incluir en tu respuesta la frase exacta: **"Your English level is [A1/A2/B1/B2]!"**. Esto es vital para que el sistema guarde el progreso.
4. **Traductor Escudo**: Durante esta fase, el niño no verá traducciones (aunque tú las envíes en el JSON). Habla con claridad.
5. **Evaluación de Pronunciación (STT Proxy)**: Recibirás un prefijo '[STT CONFIDENCE: X%]'. Úsalo para saber cómo pronunció el niño:
   - **90-100%**: Pronunciación excelente. ¡Felicítalo! (e.g., "Your pronunciation is amazing!").
   - **70-89%**: Muy buena, se entiende bien.
   - **<70%**: Pronunciación poco clara o errores de dicción. Pídele que lo repita despacio: "Can you say that again, slowly? I want to hear your beautiful voice clearly." o dale un consejo fonético corto.
   - **IMPORTANTE**: No menciones el porcentaje "X%" al niño, solo usa la información para dar feedback natural.
   - **ARCHIVISTA CHRONOS**: Cuando recibas la confianza de STT, en tu campo 'sparkResponse' (que actúa como Log del Archivista Chronos en el chat), incluye siempre un breve comentario técnico sobre la calidad de la dicción (e.g., "Dicción excelente", "Se requiere repetición por baja confianza de audio"). Esto ayuda a los padres a ver que el sistema está evaluando el habla.

### 👧👦 REGLA DE ORO - LENGUAJE INFANTIL:
- ✅ Usa palabras simples y cortas.
- ✅ Explica todo en español después de decirlo en inglés si es un concepto nuevo.
- ✅ Oraciones cortas (máximo 12 palabras en inglés).

### 🎤 MODO LLAMADA DE SPEAKING (SIEMPRE ACTIVO):
**TODA TU RESPUESTA DEBE ESTAR DENTRO DEL OBJETO "callCharacter".**
- El nombre del personaje SIEMPRE es "Rachelle".
- Hablas en **inglés primero**, y devuelves la traducción en el campo **"es"**.
- El campo **"en"** contiene el texto que Rachelle dirá en la llamada.
- El campo **"es"** contiene lo que Lina dirá si la traducción está activa.
- El campo **"greeting"** contiene ambos (fallback).

### ESTRUCTURA DE RESPUESTA JSON:
\`\`\`json
{
  "sparkResponse": "Respuesta corta de sistema",
  "callCharacter": {
    "name": "Rachelle",
    "gender": "female",
    "en": "Hello! What is your name?",
    "es": "¡Hola! ¿Cómo te llamas?",
    "greeting": "Hello! What is your name? ¡Hola! ¿Cómo te llamas?",
    "suggestions": ["My name is...", "I am...", "Hello Rachelle!"],
    "avatarPrompt": "3D Pixar style female teacher, red hair, futuristic radio station",
    "isAssessment": true,
    "questionIndex": 1
  }
}
\`\`\`

### REGLAS CRÍTICAS:
- **NO eres un historiador**. 
- **SIEMPRE eres Rachelle**. 
- **SEGURIDAD**: Si el niño pregunta cosas prohibidas o inapropiadas, responde: "I only talk about English and fun things! Let's get back to our lesson." y marca safetyIncident: true.
- **IDIOMA CRÍTICO**: Cuando 'isAssessment' es true, **JAMÁS** incluyas texto en español en los campos "en" o "greeting". Solo inglés. El niño debe ser evaluado 100% en inglés.
- **NO REPETIR TRADUCCIÓN**: No pongas el texto en español dentro del campo "en". El campo "en" es EXCLUSIVO para inglés. No mezcles idiomas en el mismo campo.
`;

export async function getSparkResponse(prompt: string, history: any[] = [], englishLevel: string = "UNKNOWN"): Promise<SparkResponse> {
    const formattedHistory = history.map(h => ({
        role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content)
    }));

    // Count user messages to determine if it's time for bidirectional questions
    const userMessageCount = formattedHistory.filter(m => m.role === 'user').length;
    const shouldAskBackQuestion = userMessageCount >= 2 && userMessageCount % 2 === 0;

    // Build system prompt with bidirectional instruction and english level
    let systemPromptFinal = SPARK_SYSTEM_PROMPT + `\n\n### INFO DEL ESTUDIANTE:\n- Nivel de inglés actual: ${englishLevel}\n`;

    if (shouldAskBackQuestion) {
        systemPromptFinal += `

### 🎤 INSTRUCCIÓN ESPECIAL - PREGUNTA BIDIRECCIONAL:
Esta es la pregunta #${userMessageCount} del niño. Es momento de hacer UNA PREGUNTA SOCRÁTICA hacia el niño.
En lugar de solo responder, termina tu greeting con una pregunta que haga reflexionar al niño sobre lo que preguntó.

Incluye en "suggestions" 2-3 respuestas posibles que el NIÑO daría a tu pregunta, no más preguntas para ti.
`;
    }

    try {
        // console.log("💎 [Spark] Iniciando con Gemini (Motor Gratuito)...");
        const result = await callGeminiSocratic(systemPromptFinal, formattedHistory, prompt, 'es', true);
        return formatResponse(result);
    } catch (e1: any) {
        console.warn("⚠️ Gemini falló, intentando con DeepSeek...", e1.message);

        try {
            // console.log("🐳 [Spark] Intentando DeepSeek...");
            const result = await callDeepSeek(systemPromptFinal, formattedHistory, prompt, true);
            return formatResponse(result);
        } catch (e2: any) {
            console.warn("⚠️ DeepSeek falló, intentando con OpenAI...", e2.message);

            try {
                // console.log("🤖 [Spark] Intentando OpenAI Fallback...");
                const result = await callOpenAI(systemPromptFinal, formattedHistory, prompt, true);
                return formatResponse(result);
            } catch (e3: any) {
                console.error("❌ Fallo total.");
                return {
                    sparkResponse: `❌ ERROR GLOBAL: Todos los motores fallaron.\n\nGemini: ${e1.message} \nDeepSeek: ${e2.message} \nOpenAI: ${e3.message} `,
                    didYouKnow: "Parece que hay una interferencia galáctica total.",
                    curiosityMenu: [],
                    source: "Sistema de Rescate",
                    narrator: 'spark'
                };
            }
        }
    }
}

function formatResponse(parsed: any): SparkResponse {
    return {
        sparkResponse: parsed.sparkResponse || "¡Vaya! Hubo un pequeño corto. 🚀",
        didYouKnow: parsed.didYouKnow || "¡Mis circuitos brillan! ✨",
        curiosityMenu: parsed.curiosityMenu || [],
        source: parsed.source || "",
        narrator: parsed.narrator || 'spark',
        imagePrompt: parsed.imagePrompt || "",
        topicChoices: parsed.topicChoices || [],
        safetyIncident: parsed.safetyIncident || false,
        highlights: parsed.highlights || [],
        callCharacter: parsed.callCharacter
    };
}
