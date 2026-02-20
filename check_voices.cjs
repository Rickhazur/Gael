const https = require('https');

const apiKey = 'sk_3bfd0ecfb8140d8ee48154837bf48142763a634296d9f5a6';

const options = {
    hostname: 'api.elevenlabs.io',
    path: '/v1/voices',
    method: 'GET',
    headers: {
        'xi-api-key': apiKey
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const voices = JSON.parse(data).voices;
            console.log('Voices found: ' + voices.length);
            voices.forEach(v => {
                if (v.name.includes('Lina') || v.voice_id === 'VmejBeYhbrcTPwDniox7') {
                    console.log(`FOUND: ${v.name} - ${v.voice_id} - ${v.category}`);
                }
            });
            // Also list first 3 to show connection works
            console.log('Sample voices:', voices.slice(0, 3).map(v => `${v.name}: ${v.voice_id}`));
        } else {
            console.log('Error: ' + res.statusCode);
            console.log(data);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
