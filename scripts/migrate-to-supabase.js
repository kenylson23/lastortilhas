import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function migrateToSupabase() {
  console.log('🔄 Iniciando migração para Supabase...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada');
    process.exit(1);
  }

  const isSupabase = process.env.DATABASE_URL.includes('supabase.co') || process.env.DATABASE_URL.includes('supabase.com');
  
  const poolConfig = isSupabase 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      }
    : {
        connectionString: process.env.DATABASE_URL,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      };

  const pool = new Pool(poolConfig);
  
  try {
    console.log(`🔗 Conectando ao ${isSupabase ? 'Supabase' : 'PostgreSQL'}...`);
    
    // Testar conexão primeiro
    const testClient = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso');
    testClient.release();
    
    // Criar extensões necessárias (se Supabase)
    if (isSupabase) {
      console.log('🔧 Configurando extensões Supabase...');
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    }
    
    // Limpar tabelas existentes se necessário
    console.log('🧹 Limpando estrutura anterior...');
    await pool.query('DROP TABLE IF EXISTS reservations CASCADE;');
    await pool.query('DROP TABLE IF EXISTS gallery_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_categories CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    
    // Criar tabelas
    console.log('📋 Criando tabelas...');
    
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE menu_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        image TEXT,
        category_id INTEGER NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
        spicy_level INTEGER DEFAULT 0,
        vegetarian BOOLEAN DEFAULT false,
        featured BOOLEAN DEFAULT false,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE gallery_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        src TEXT NOT NULL,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE reservations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pendente',
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Criar usuário admin
    console.log('👤 Criando usuário administrador...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, 'admin']
    );
    
    // Inserir categorias do menu
    console.log('🍽️ Inserindo categorias do menu...');
    const categoriesResult = await pool.query(`
      INSERT INTO menu_categories (name, description, "order") VALUES 
      ('Tacos', 'Nossos famosos tacos mexicanos', 1),
      ('Burritos', 'Burritos grandes e saborosos', 2),
      ('Quesadillas', 'Quesadillas crocantes e deliciosas', 3),
      ('Bebidas', 'Refrescos e bebidas especiais', 4)
      RETURNING id, name;
    `);
    
    console.log(`✅ ${categoriesResult.rows.length} categorias criadas`);
    
    // Inserir itens do menu
    console.log('🌮 Inserindo itens do menu...');
    const menuResult = await pool.query(`
      INSERT INTO menu_items (name, description, price, category_id, spicy_level, vegetarian, featured, "order", active, image) VALUES 
      ('Taco de Carnitas', 'Taco com carne de porco desfiada, cebola e coentro', 450, 1, 2, false, true, 1, true, '/images/menu/taco-carnitas.jpg'),
      ('Taco de Pollo', 'Taco com frango grelhado, alface e molho especial', 400, 1, 1, false, false, 2, true, '/images/menu/taco-pollo.jpg'),
      ('Taco Vegetariano', 'Taco com vegetais grelhados e guacamole', 380, 1, 1, true, false, 3, true, '/images/menu/taco-vegetariano.jpg'),
      ('Burrito Supremo', 'Burrito com carne, feijão, arroz, queijo e molhos', 850, 2, 2, false, true, 1, true, '/images/menu/burrito-supremo.jpg'),
      ('Burrito Vegetariano', 'Burrito com feijão, arroz, vegetais e queijo', 750, 2, 1, true, false, 2, true, '/images/menu/burrito-vegetariano.jpg'),
      ('Quesadilla de Queijo', 'Quesadilla clássica com queijo derretido', 650, 3, 0, true, false, 1, true, '/images/menu/quesadilla-queijo.jpg'),
      ('Quesadilla de Frango', 'Quesadilla com frango temperado e queijo', 720, 3, 1, false, false, 2, true, '/images/menu/quesadilla-frango.jpg'),
      ('Horchata', 'Bebida tradicional mexicana com canela', 250, 4, 0, true, false, 1, true, '/images/menu/horchata.jpg'),
      ('Agua de Jamaica', 'Refrescante bebida de hibisco', 200, 4, 0, true, false, 2, true, '/images/menu/agua-jamaica.jpg'),
      ('Margarita', 'Coquetel tradicional mexicano', 350, 4, 0, false, true, 3, true, '/images/menu/margarita.jpg')
      RETURNING id, name;
    `);
    
    console.log(`✅ ${menuResult.rows.length} itens do menu criados`);
    
    // Inserir itens da galeria
    console.log('🖼️ Inserindo itens da galeria...');
    const galleryResult = await pool.query(`
      INSERT INTO gallery_items (title, description, src, "order", active) VALUES 
      ('Ambiente Aconchegante', 'Interior do restaurante com decoração mexicana tradicional', '/images/gallery/interior-1.jpg', 1, true),
      ('Pratos Especiais', 'Nossos deliciosos pratos mexicanos frescos', '/images/gallery/food-1.jpg', 2, true),
      ('Tacos Tradicionais', 'Tacos preparados com ingredientes frescos', '/images/gallery/tacos-1.jpg', 3, true),
      ('Guacamole Fresco', 'Guacamole preparado na hora', '/images/gallery/guacamole-1.jpg', 4, true),
      ('Área Externa', 'Terraço com vista para a cidade', '/images/gallery/exterior-1.jpg', 5, true),
      ('Equipe Especializada', 'Nossa equipe preparando os melhores pratos', '/images/gallery/chef-1.jpg', 6, true)
      RETURNING id, title;
    `);
    
    console.log(`✅ ${galleryResult.rows.length} itens da galeria criados`);
    
    // Verificar dados criados
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM menu_categories) as categories,
        (SELECT COUNT(*) FROM menu_items) as menu_items,
        (SELECT COUNT(*) FROM gallery_items) as gallery_items
    `);
    
    console.log('📊 Estatísticas finais:');
    console.log(`   👥 Usuários: ${stats.rows[0].users}`);
    console.log(`   📂 Categorias: ${stats.rows[0].categories}`);
    console.log(`   🍽️ Itens do menu: ${stats.rows[0].menu_items}`);
    console.log(`   🖼️ Itens da galeria: ${stats.rows[0].gallery_items}`);
    
    console.log('🎉 Migração para Supabase concluída com sucesso!');
    console.log('🔑 Credenciais do admin: username: admin, password: admin123');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    if (error.code) {
      console.error('🔧 Código do erro:', error.code);
    }
    throw error;
  } finally {
    await pool.end();
  }
}

migrateToSupabase()
  .then(() => {
    console.log('✅ Script de migração concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na migração:', error.message);
    process.exit(1);
  });