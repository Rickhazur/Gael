const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_KEY = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkRecentUsers() {
    const searchTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log(`Checking users since (UTC): ${searchTime}`);

    const { data: users, error } = await supabase
        .from('profiles')
        .select('name, email, role, account_status, created_at')
        .gt('created_at', searchTime)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (users.length === 0) {
        console.log('No recent accounts found.');
    } else {
        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.name} (${u.email}) - Rol: ${u.role}, Estado: ${u.account_status}, Fecha: ${u.created_at}`);
        });
    }
}

checkRecentUsers();
