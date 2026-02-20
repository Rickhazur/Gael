import https from 'https';

const keys = [
    'sk_3bfd0ecfb8140d8ee48154837bf48142763a634296d9f5a6',
    'sk_8895795b0e938364f392b08ba3651f4dfec70e9c99fe9a1e',
    'e2460b239a3a9622ba4a69a7d8dc613f2ee636f3f81e46632f9d0a63cea5943f'
];

async function check(key) {
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'api.elevenlabs.io',
            path: '/v1/user/subscription',
            method: 'GET',
            headers: { 'xi-api-key': key }
        }, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const s = JSON.parse(d);
                    const rem = s.character_limit - s.character_count;
                    console.log(`Key: ${key.substring(0, 10)}... | Restante: ${rem} caracteres`);
                    resolve(rem > 500 ? key : null);
                } else {
                    console.log(`Key: ${key.substring(0, 10)}... | Error: ${res.statusCode}`);
                    resolve(null);
                }
            });
        });
        req.end();
    });
}

async function main() {
    console.log("🔍 Buscando cuál de las 3 llaves tiene créditos...");
    for (const k of keys) {
        const result = await check(k);
        if (result) {
            console.log(`\n✅ ¡ENCONTRADA! Usaremos la que termina en ...${k.substring(k.length - 5)}`);
        }
    }
}

main();
