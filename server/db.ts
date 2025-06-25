import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co') || url.includes('supabase.com');
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Please configure your database connection.");
}

const isSupabase = isSupabaseUrl(process.env.DATABASE_URL);
let poolConfig;

if (isSupabase) {
  console.log('🔗 Detectada URL do Supabase, configurando conexão...');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
  };
} else {
  console.log('🔗 Configurando conexão para banco de dados...');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
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