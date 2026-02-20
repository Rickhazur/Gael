const https = require('https');
const apiKey = 'sk_8895795b0e938364f392b08ba3651f4dfec70e9c99fe9a1e';
const options = { hostname: 'api.elevenlabs.io', path: '/v1/voices', method: 'GET', headers: { 'xi-api-key': apiKey } };
https.request(options, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const voices = JSON.parse(d).voices;
        voices.forEach(v => {
            if (v.labels && v.labels.accent === 'american') return;
            console.log(`${v.name}:${v.voice_id}`);
        });
    });
}).end();
