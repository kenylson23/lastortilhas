import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function recreateSupabaseTables() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  
  try {
    console.log('🔧 Recriando tabelas no Supabase para aparecer no dashboard...\n');
    
    // 1. Remover tabelas existentes na ordem correta (respeitando foreign keys)
    console.log('🗑️ Removendo tabelas existentes...');
    await client.query('DROP TABLE IF EXISTS reservations CASCADE');
    await client.query('DROP TABLE IF EXISTS gallery_items CASCADE');
    await client.query('DROP TABLE IF EXISTS menu_items CASCADE');
    await client.query('DROP TABLE IF EXISTS menu_categories CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS session CASCADE');
    
    // 2. Criar tabelas com BIGSERIAL (padrão Supabase) e timestamps corretos
    console.log('📋 Criando tabelas...');
    
    await client.query(`
      CREATE TABLE users (
        id BIGSERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela users criada');
    
    await client.query(`
      CREATE TABLE menu_categories (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela menu_categories criada');
    
    await client.query(`
      CREATE TABLE menu_items (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        category_id BIGINT REFERENCES menu_categories(id) ON DELETE CASCADE,
        image TEXT,
        active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        spicy_level INTEGER DEFAULT 0,
        vegetarian BOOLEAN DEFAULT false,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela menu_items criada');
    
    await client.query(`
      CREATE TABLE gallery_items (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        src TEXT NOT NULL,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela gallery_items criada');
    
    await client.query(`
      CREATE TABLE reservations (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pendente',
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela reservations criada');
    
    // 3. Inserir dados com senha hash correta
    console.log('\n🔑 Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, 'admin']
    );
    
    console.log('🍽️ Inserindo categorias do menu...');
    await client.query(`
      INSERT INTO menu_categories (name, description, "order", active) VALUES 
      ('Entradas', 'Deliciosos aperitivos para começar sua refeição', 1, true),
      ('Pratos Principais', 'Nossos pratos tradicionais mexicanos', 2, true),
      ('Bebidas', 'Refrescantes bebidas mexicanas', 3, true),
      ('Sobremesas', 'Doces tradicionais mexicanos', 4, true)
    `);
    
    console.log('🌮 Inserindo itens do menu...');
    await client.query(`
      INSERT INTO menu_items (name, description, price, category_id, active, featured, spicy_level, vegetarian, "order", image) VALUES 
      ('Guacamole', 'Abacate fresco com tomate, cebola e coentro', 1600, 1, true, true, 1, true, 1, '/images/menu/guacamole.jpg'),
      ('Nachos Supremos', 'Nachos com queijo derretido, jalapeños e molho', 1900, 1, true, false, 2, false, 2, '/images/menu/nachos-supremos.jpg'),
      ('Quesadillas', 'Tortillas recheadas com queijo e temperos', 1300, 1, true, false, 1, true, 3, '/images/menu/quesadillas.jpg'),
      ('Tacos de Carne', 'Três tacos tradicionais com carne temperada', 2500, 2, true, true, 2, false, 1, '/images/menu/tacos-de-carne.jpg'),
      ('Burrito Especial', 'Burrito grande com carne, feijão e queijo', 2300, 2, true, true, 2, false, 2, '/images/menu/burrito-especial.jpg'),
      ('Enchiladas', 'Tortillas recheadas com molho especial', 2700, 2, true, false, 3, false, 3, '/images/menu/enchiladas.jpg'),
      ('Fajitas de Frango', 'Frango grelhado com pimentões e cebola', 2900, 2, true, true, 2, false, 4, '/images/menu/fajitas-de-frango.jpg'),
      ('Agua Fresca', 'Bebida refrescante de frutas naturais', 900, 3, true, false, 0, true, 1, '/images/menu/agua-fresca.jpg'),
      ('Horchata', 'Bebida tradicional de arroz e canela', 1000, 3, true, false, 0, true, 2, '/images/menu/horchata.jpg'),
      ('Margarita', 'Coquetel tradicional mexicano', 1700, 3, true, false, 0, false, 3, '/images/menu/margarita.jpg'),
      ('Churros', 'Doces fritos com açúcar e canela', 1300, 4, true, true, 0, true, 1, '/images/menu/churros.jpg'),
      ('Flan', 'Pudim tradicional mexicano', 1500, 4, true, false, 0, true, 2, '/images/menu/flan.jpg')
    `);
    
    console.log('🖼️ Inserindo itens da galeria...');
    await client.query(`
      INSERT INTO gallery_items (title, description, src, "order", active) VALUES 
      ('Ambiente Aconchegante', 'Interior do restaurante com decoração mexicana tradicional', '/images/gallery/interior-1.jpg', 1, true),
      ('Pratos Especiais', 'Nossos deliciosos pratos mexicanos frescos', '/images/gallery/food-1.jpg', 2, true),
      ('Tacos Tradicionais', 'Tacos preparados com ingredientes frescos', '/images/gallery/tacos-1.jpg', 3, true),
      ('Guacamole Fresco', 'Guacamole preparado na hora', '/images/gallery/guacamole-1.jpg', 4, true),
      ('Área Externa', 'Terraço com vista para a cidade', '/images/gallery/exterior-1.jpg', 5, true),
      ('Equipe Especializada', 'Nossa equipe preparando os melhores pratos', '/images/gallery/chef-1.jpg', 6, true)
    `);
    
    // 4. Verificar se tudo foi criado corretamente
    console.log('\n📊 Verificando dados inseridos...');
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM users'),
      client.query('SELECT COUNT(*) FROM menu_categories'),
      client.query('SELECT COUNT(*) FROM menu_items'),
      client.query('SELECT COUNT(*) FROM gallery_items'),
      client.query('SELECT COUNT(*) FROM reservations')
    ]);
    
    console.log(`  - users: ${counts[0].rows[0].count}`);
    console.log(`  - menu_categories: ${counts[1].rows[0].count}`);
    console.log(`  - menu_items: ${counts[2].rows[0].count}`);
    console.log(`  - gallery_items: ${counts[3].rows[0].count}`);
    console.log(`  - reservations: ${counts[4].rows[0].count}`);
    
    console.log('\n✅ Tabelas recriadas com sucesso!');
    console.log('🎯 Agora as tabelas devem aparecer no dashboard do Supabase');
    console.log('🔑 Credenciais: admin / admin123');
    
  } catch (error) {
    console.error('❌ Erro ao recriar tabelas:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

recreateSupabaseTables();