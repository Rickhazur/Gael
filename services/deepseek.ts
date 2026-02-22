
import { withTimeoutAndRetry, safeParseJSON } from "../lib/apiUtils";

const API_KEY = typeof import.meta !== 'undefined'
    ? (import.meta.env?.VITE_DEEPSEEK_API_KEY || '').trim()
    : '';

export async function callDeepSeek(
    systemPrompt: string,
    history: { role: 'user' | 'assistant', content: string }[],
    userMessage: string,
    jsonMode: boolean = true
) {
    if (!API_KEY) throw new Error("Falta VITE_DEEPSEEK_API_KEY");

    let finalContent = userMessage;
    if (Array.isArray(userMessage)) {
        finalContent = userMessage.filter(item => item.type === 'text')
            .map(item => item.text)
            .join('\n\n');
    }

    const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: finalContent }
    ];

    return withTimeoutAndRetry(
        async () => {
            const res = await fetch("/api-deepseek/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages,
                    temperature: 0.7,
                    response_format: jsonMode ? { type: "json_object" } : { type: "text" }
                })
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error?.message || `Error DeepSeek: ${res.status}`);
            }

            const data = await res.json();
            let content = data.choices[0].message.content;
            if (jsonMode) {
                const parsed = safeParseJSON(content, 'DeepSeek');
                if (parsed === null) throw new Error("JSON inválido de DeepSeek");
                return parsed;
            }
            return content;
        },
        { timeoutMs: 60_000, maxRetries: 1, label: "DeepSeek" }
    );
}
