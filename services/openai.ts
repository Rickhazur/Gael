
import { withTimeoutAndRetry, safeParseJSON } from "../lib/apiUtils";

const API_KEY = typeof import.meta !== 'undefined'
    ? (import.meta.env?.VITE_OPENAI_API_KEY || '')
    : '';

export async function callOpenAI(
    systemPrompt: string,
    history: { role: 'user' | 'assistant', content: string }[],
    userMessage: string,
    jsonMode: boolean = true
) {
    if (!API_KEY) {
        throw new Error("Falta la clave de OpenAI.");
    }

    const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: userMessage }
    ];

    try {
        const responseText = await withTimeoutAndRetry(
            async () => {
                const url = `/api-openai/v1/chat/completions`;

                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: messages,
                        temperature: 0.7,
                        response_format: jsonMode ? { type: "json_object" } : { type: "text" }
                    })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    let errorData: any = {};
                    try { errorData = JSON.parse(errorText); } catch (e) { }
                    throw new Error(errorData.error?.message || `Error de OpenAI: ${res.status}`);
                }

                const data = await res.json();
                return data.choices[0].message.content || "";
            },
            { timeoutMs: 30_000, maxRetries: 1, label: "OpenAI" }
        );

        if (jsonMode) {
            const parsed = safeParseJSON(responseText, 'OpenAI');
            if (parsed === null) throw new Error("JSON inválido de OpenAI");
            return parsed;
        }
        return responseText;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw error;
    }
}

export async function generateOpenAIImage(prompt: string): Promise<string | null> {
    if (!API_KEY) {
        console.warn("Falta la clave de OpenAI para generar imágenes.");
        return null;
    }

    try {
        const response = await withTimeoutAndRetry(
            async () => {
                const url = `/api-openai/v1/images/generations`;

                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "dall-e-3",
                        prompt: prompt,
                        n: 1,
                        size: "1024x1024",
                        response_format: "b64_json"
                    })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    let errorData: any = {};
                    try { errorData = JSON.parse(errorText); } catch (e) { }
                    throw new Error(errorData.error?.message || `Error de OpenAI DALL-E: ${res.status}`);
                }

                const data = await res.json();
                return data.data[0].b64_json || data.data[0].url || null;
            },
            { timeoutMs: 40_000, maxRetries: 1, label: "DALL-E 3" }
        );

        if (response && !response.startsWith('http')) {
            return `data:image/png;base64,${response}`;
        }

        return response;
    } catch (error) {
        console.error("OpenAI DALL-E Image Error:", error);
        return null;
    }
}
