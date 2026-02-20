
/**
 * 🎙️ TTSMaker Service
 * Handles text-to-speech using the TTSMaker API.
 * Voice ID 330012 = Dalia (Mexico) Female
 */

export async function generateTTSMakerSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    const apiKey = import.meta.env.VITE_TTSMAKER_API_KEY;
    if (!apiKey) {
        throw new Error("MISSING_TTSMAKER_API_KEY");
    }

    const payload = {
        ttsmaker_token: apiKey,
        text: text,
        voice_id: voiceId,
        audio_format: "mp3",
        audio_speed: 1.0,
        audio_volume: 0,
        audio_pitch: 1.0,
        param: ""
    };

    const response = await fetch('/api/v1/ttsmaker/create-tts-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`TTSMAKER_API_ERROR: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== "success") {
        throw new Error(`TTSMAKER_ERROR: ${data.message || 'Unknown error'}`);
    }

    // TTSMaker returns a URL to the audio file
    const audioUrl = data.audio_details.audio_url;
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
        throw new Error("FAILED_TO_FETCH_TTSMAKER_AUDIO_FILE");
    }

    return await audioResponse.arrayBuffer();
}
