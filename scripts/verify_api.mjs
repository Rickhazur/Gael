import https from 'https';
import fs from 'fs';

const API_KEY = 'sk_8895795b0e938364f392b08ba3651f4dfec70e9c99fe9a1e';

const options = {
    hostname: 'api.elevenlabs.io',
    path: '/v1/voices',
    method: 'GET',
    headers: {
        'xi-api-key': API_KEY
    }
};

console.log('🔍 Testing API Key...');

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

            // Save to file
            fs.writeFileSync('./voices_list.json', JSON.stringify(voices, null, 2));
            console.log('💾 Saved voices list to voices_list.json');

            console.log('\n🎤 Looking for Lina voice (VmejBeYhbrcTPwDniox7)...');
            const lina = voices.voices.find(v => v.voice_id === 'VmejBeYhbrcTPwDniox7');
            if (lina) {
                console.log(`✅ Found: ${lina.name}`);
                console.log(`   Voice ID: ${lina.voice_id}`);
                console.log(`   Labels:`, lina.labels);
            } else {
                console.log('❌ Voice ID VmejBeYhbrcTPwDniox7 not found in this account');
                console.log('\n📋 First 5 available voices:');
                voices.voices.slice(0, 5).forEach(v => {
                    console.log(`  - ${v.name} (${v.voice_id})`);
                });
            }
        } else {
            console.log('❌ API Key is INVALID');
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request Error:', error);
});

req.end();
