import https from 'https';

const API_KEY = 'e2460b239a3a9622ba4a69a7d8dc613f2ee636f3f81e46632f9d0a63cea5943f';
const VOICE_ID = 'VmejBeYhbrcTPwDniox7';

console.log('🔍 Testing if this API key has access to Lina voice...');
console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`🎤 Voice ID: ${VOICE_ID}`);

// First, test the API key
const options = {
    hostname: 'api.elevenlabs.io',
    path: '/v1/voices',
    method: 'GET',
    headers: {
        'xi-api-key': API_KEY
    }
};

const req = https.request(options, (res) => {
    console.log(`📡 Status Code: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const voices = JSON.parse(data);
            console.log('✅ API Key is VALID!');
            console.log(`📢 Available voices: ${voices.voices.length}`);

            const lina = voices.voices.find(v => v.voice_id === VOICE_ID);
            if (lina) {
                console.log(`\n✅✅✅ FOUND LINA! ✅✅✅`);
                console.log(`   Name: ${lina.name}`);
                console.log(`   Voice ID: ${lina.voice_id}`);
                console.log(`   Labels:`, lina.labels);
            } else {
                console.log(`\n❌ Voice ID ${VOICE_ID} not found in this account either`);
                console.log('\nFirst 5 voices:');
                voices.voices.slice(0, 5).forEach(v => {
                    console.log(`  - ${v.name} (${v.voice_id})`);
                });
            }
        } else if (res.statusCode === 401) {
            console.log('❌ API Key is INVALID (401 Unauthorized)');
            console.log('This is not a valid ElevenLabs API key');
        } else {
            console.log(`❌ Error ${res.statusCode}`);
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request Error:', error);
});

req.end();
