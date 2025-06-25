import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co') || url.includes('supabase.com');
}

// URL do Supabase validada e funcionando
const WORKING_SUPABASE_URL = "postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:6543/postgres";

// Forçar o uso da URL funcional do Supabase
const databaseUrl = WORKING_SUPABASE_URL;

const isSupabase = isSupabaseUrl(databaseUrl);
let poolConfig;

if (isSupabase) {
  console.log('🔗 Conectando ao Supabase...');
  poolConfig = {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
  };
} else {
  console.log('🔗 Configurando conexão para banco de dados...');
  poolConfig = {
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });

// Monitor connection events
pool.on('connect', () => {
  console.log('✅ Conexão com banco de dados estabelecida');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com banco de dados:', err.message);
  
  // If Supabase fails, we could implement fallback logic here
  if (isSupabase && err.message.includes('ENOTFOUND')) {
    console.log('💡 Dica: Verifique se o projeto Supabase está ativo no painel');
  }
});