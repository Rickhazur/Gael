
import { withTimeoutAndRetry, safeParseJSON } from "../lib/apiUtils";

const API_KEY = typeof import.meta !== 'undefined'
    ? (import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.VITE_GOOGLE_GEMINI_API_KEY || '').trim()
    : '';

export async function callGeminiSocratic(
    systemPrompt: string,
    history: { role: 'user' | 'assistant', content: string }[],
    userMessage: string | any[],
    language: 'es' | 'en',
    jsonMode: boolean = true
) {
    if (!API_KEY) throw new Error("Falta la clave VITE_GEMINI_API_KEY.");

    const contents: any[] = [];
    let lastRole: string | null = null;

    history.forEach(h => {
        const currentRole = h.role === 'user' ? 'user' : 'model';
        if (currentRole !== lastRole) {
            contents.push({
                role: currentRole,
                parts: [{ text: h.content }]
            });
            lastRole = currentRole;
        } else {
            contents[contents.length - 1].parts[0].text += "\n\n" + h.content;
        }
    });

    if (contents.length > 0 && contents[0].role === 'model') {
        contents.unshift({ role: 'user', parts: [{ text: "Hola!" }] });
    }

    const finalParts: any[] = [];
    if (typeof userMessage === 'string') {
        finalParts.push({ text: userMessage });
    } else if (Array.isArray(userMessage)) {
        for (const item of userMessage) {
            if (item.type === 'text') {
                finalParts.push({ text: item.text });
            } else if (item.type === 'image_url') {
                const url = item.image_url.url;
                const mimeMatch = url.match(/^data:(image\/[a-zA-Z]+);base64,/);
                const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
                const b64 = url.replace(/^data:[^;]+;base64,/, '');
                finalParts.push({
                    inline_data: { mime_type: mimeType, data: b64 }
                });
            }
        }
    } else {
        finalParts.push({ text: JSON.stringify(userMessage) });
    }

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts.push(...finalParts);
    } else {
        contents.push({ role: 'user', parts: finalParts });
    }

    // LISTA DE MODELOS A INTENTAR (v1beta endpoint)
    const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

    async function tryGemini(modelName: string) {
        // v1beta soporta response_mime_type para JSON mode
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        console.log(`📡 [Gemini] Intentando modelo: ${modelName}...`);

        const body: any = {
            contents,
            generationConfig: {
                temperature: 0.7,
                max_output_tokens: 2048,
            }
        };

        // En v1, para máxima compatibilidad, enviamos las instrucciones en el primer mensaje
        if (systemPrompt && contents.length > 0) {
            contents[0].parts[0].text = `INSTRUCCIONES: ${systemPrompt}\n\nMENSAJE: ${contents[0].parts[0].text}`;
        }

        if (jsonMode) {
            body.generationConfig.response_mime_type = "application/json";
        }

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Error ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
    }

    return withTimeoutAndRetry(
        async () => {
            let lastErr: any;
            for (const model of MODELS) {
                try {
                    const textResult = await tryGemini(model);
                    if (jsonMode) {
                        const parsed = safeParseJSON(textResult, `Gemini-${model}`);
                        if (parsed === null) throw new Error(`JSON inválido de ${model}`);
                        return parsed;
                    }
                    return textResult;
                } catch (e) {
                    console.warn(`⚠️ Falló ${model}, intentando siguiente...`);
                    lastErr = e;
                }
            }
            throw lastErr;
        },
        { timeoutMs: 35_000, maxRetries: 1, label: "Gemini-Scanner" }
    );
}
export async function callGeminiVision(
    systemPrompt: string,
    imageB64: string, // Base64 string WITHOUT data:image/png;base64,
    mimeType: string = "image/jpeg"
) {
    if (!API_KEY) throw new Error("Falta la clave VITE_GEMINI_API_KEY.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const body = {
        contents: [{
            parts: [
                { text: systemPrompt },
                {
                    inline_data: {
                        mime_type: mimeType,
                        data: imageB64
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.1, // Lower temperature for more factual extraction
            response_mime_type: "application/json",
        }
    };

    return withTimeoutAndRetry(
        async () => {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            const textResult = data.candidates[0].content.parts[0].text;
            const parsed = safeParseJSON(textResult, 'Gemini-Vision');
            if (parsed === null) throw new Error('JSON inválido de Gemini Vision');
            return parsed;
        },
        { timeoutMs: 60_000, maxRetries: 2, label: "Gemini-Vision" }
    );
}
