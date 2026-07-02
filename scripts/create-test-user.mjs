import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function loadEnv(path) {
  const content = readFileSync(path, 'utf-8');
  const result = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    result[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return result;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
const env = loadEnv(envPath);

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const email = 'turista@rimay.pe';
const password = 'Rimay2025!';

const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceRoleKey}`,
    'apikey': serviceRoleKey,
  },
  body: JSON.stringify({ email, password, email_confirm: true }),
});

const data = await res.json();

if (!res.ok) {
  const msg = String(data.message || data.msg || '');
  if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists') || msg.toLowerCase().includes('duplicate')) {
    console.log('✅ El usuario ya existe.');
    process.exit(0);
  }
  console.error('❌ Error:', JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log(`✅ Usuario creado: ${email} / ${password}`);
console.log(`   ID: ${data.id}`);
