import { pool } from '../server/db.js';

async function main() {
  console.log('Configurando banco de dados...');
  
  try {
    // Criar as tabelas com base no schema
    console.log('Criando tabelas...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "order" INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT NOT NULL,
        price INTEGER NOT NULL,
        spicy_level INTEGER DEFAULT 0,
        image TEXT NOT NULL,
        featured BOOLEAN DEFAULT false,
        category_id INTEGER REFERENCES menu_categories(id),
        "order" INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        src TEXT NOT NULL,
        thumbnail TEXT,
        type TEXT NOT NULL DEFAULT 'image',
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Tabelas criadas com sucesso!');
    
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
  } finally {
    // Fechando a conexão
    await pool.end();
    process.exit(0);
  }
}

main();