import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from "openai";


export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!process.env.DEEPSEEK_API_KEY) {
            throw new Error("Missing DEEPSEEK_API_KEY in environment variables.");
        }

        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: process.env.DEEPSEEK_API_KEY,
        });

        const { messages, model, tools, tool_choice, response_format, stream } = req.body;

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const streamResponse = await openai.chat.completions.create({
                model: model || "deepseek-chat",
                messages,
                tools,
                tool_choice,
                response_format,
                stream: true,
            });

            for await (const chunk of streamResponse) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            }
            res.end();
        } else {
            const completion = await openai.chat.completions.create({
                model: model || "deepseek-chat",
                messages,
                temperature: 0.75,
                max_tokens: 600,
            });

            return res.status(200).json(completion);
        }

    } catch (err: any) {
        console.error("AI Engine CRITICAL Error:", err);
        console.error("API Key present:", !!process.env.DEEPSEEK_API_KEY);
        return res.status(500).json({ error: "Error calling AI Engine", details: err.message });
    }
}
