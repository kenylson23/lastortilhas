import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Configurar WebSocket apenas se não estiver no Vercel
async function setupWebSocket() {
  if (!process.env.VERCEL && typeof window === 'undefined') {
    try {
      const ws = await import("ws");
      neonConfig.webSocketConstructor = ws.default;
    } catch (error) {
      console.warn('WebSocket not available:', error.message);
    }
  }
}

// Inicializar WebSocket de forma assíncrona
setupWebSocket();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });