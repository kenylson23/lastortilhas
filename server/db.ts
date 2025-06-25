import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Função para verificar se a DATABASE_URL é válida para Supabase
function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co') || url.includes('supabase.com');
}

// Configuração do pool baseada no tipo de banco
let poolConfig;

if (process.env.DATABASE_URL) {
  const isSupabase = isSupabaseUrl(process.env.DATABASE_URL);
  
  if (isSupabase) {
    console.log('🔗 Configurando conexão para Supabase...');
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  } else {
    console.log('🔗 Configurando conexão para PostgreSQL local...');
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }
} else {
  throw new Error(
    "DATABASE_URL must be set. Please configure your database connection.",
  );
}

export const pool = new Pool(poolConfig);

export const db = drizzle(pool, { schema });

// Testar conexão ao inicializar
pool.on('connect', () => {
  console.log('✅ Conexão com banco de dados estabelecida');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com banco de dados:', err.message);
});