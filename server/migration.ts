import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para executar alterações no banco de dados
 */
async function migration() {
  try {
    // Adicionar a coluna 'role' à tabela 'users' se ela não existir
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'role'
        ) THEN
          ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
        END IF;
      END $$;
    `);
    
    // Criar tabela menu_categories se não existir
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        "order" INTEGER DEFAULT 0
      );
    `);
    
    // Criar tabela menu_items se não existir
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category_id INTEGER NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
        spicy_level INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        vegetarian BOOLEAN DEFAULT false,
        available BOOLEAN DEFAULT true,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  }
}

migration();