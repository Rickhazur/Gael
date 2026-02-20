const https = require('https');
const apiKey = 'sk_3bfd0ecfb8140d8ee48154837bf48142763a634296d9f5a6';
const options = { hostname: 'api.elevenlabs.io', path: '/v1/voices', method: 'GET', headers: { 'xi-api-key': apiKey } };
https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        const voices = JSON.parse(data).voices;
        const lina = voices.find(v => v.name.includes('Lina'));
        if (lina) console.log(`LINA_ID:${lina.voice_id}`);
        else console.log("LINA_NOT_FOUND");
    });
}).end();
