
import { withTimeoutAndRetry } from "../lib/apiUtils";

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
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const url = `${origin}/api-openai/v1/chat/completions`;

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
            try {
                return JSON.parse(responseText);
            } catch (e) {
                console.error("JSON Parse Error on OpenAI response:", responseText);
                throw e;
            }
        }
        return responseText;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw error;
    }
}
