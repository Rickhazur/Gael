const https = require('https');

const apiKey = 'sk_3bfd0ecfb8140d8ee48154837bf48142763a634296d9f5a6';
const voiceId = 'VmejBeYhbrcTPwDniox7';

const postData = JSON.stringify({
    text: 'Hola',
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
    }
});

const options = {
    hostname: 'api.elevenlabs.io',
    path: `/v1/text-to-speech/${voiceId}`,
    method: 'POST',
    headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode !== 200) {
            console.log('Error Body:', data);
        } else {
            console.log('Success (Audio data received)');
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(postData);
req.end();
