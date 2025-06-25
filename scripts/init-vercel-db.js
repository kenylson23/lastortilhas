#!/usr/bin/env node
/**
 * Script para inicializar o banco de dados no Vercel
 * Execute após o deploy: node scripts/init-vercel-db.js
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { 
  users, 
  menuCategories, 
  menuItems, 
  galleryItems, 
  reservations 
} from '../shared/schema.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados no Vercel...');
    
    // Verificar se as tabelas existem
    const tables = ['users', 'menu_categories', 'menu_items', 'gallery_items', 'reservations'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Tabela ${table} existe`);
      } catch (error) {
        console.log(`❌ Tabela ${table} não existe:`, error.message);
      }
    }
    
    // Inserir dados básicos se necessário
    try {
      const existingCategories = await db.select().from(menuCategories);
      if (existingCategories.length === 0) {
        console.log('📝 Criando categorias básicas...');
        
        await db.insert(menuCategories).values([
          { name: 'Pratos Principais', description: 'Pratos principais mexicanos', order: 1 },
          { name: 'Entradas', description: 'Aperitivos e entradas', order: 2 },
          { name: 'Bebidas', description: 'Bebidas tradicionais', order: 3 }
        ]);
        
        console.log('✅ Categorias criadas');
      }
    } catch (error) {
      console.log('⚠️ Erro ao criar categorias:', error.message);
    }
    
    console.log('🎉 Inicialização concluída!');
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();