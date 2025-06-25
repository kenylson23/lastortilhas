import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function testAndMigrateSupabase() {
  // Nova URL do Supabase fornecida pelo usuário
  const supabaseUrl = 'postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  
  console.log('🔍 Testando nova conexão Supabase...');
  
  const pool = new Pool({
    connectionString: supabaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  
  try {
    // Testar conexão
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as server_time, version() as version');
    console.log('✅ Conexão Supabase estabelecida com sucesso!');
    console.log(`⏰ Servidor: ${result.rows[0].server_time}`);
    console.log(`🔧 Versão: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    client.release();
    
    // Executar migração completa
    console.log('🚀 Iniciando migração completa...');
    
    // Limpar estrutura anterior
    console.log('🧹 Preparando banco...');
    await pool.query('DROP TABLE IF EXISTS reservations CASCADE;');
    await pool.query('DROP TABLE IF EXISTS gallery_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_categories CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    
    // Criar extensões Supabase
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    
    // Criar tabelas otimizadas para Supabase
    console.log('📋 Criando estrutura...');
    
    await pool.query(`
      CREATE TABLE users (
        id BIGSERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE menu_categories (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE menu_items (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        image TEXT,
        category_id BIGINT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
        spicy_level INTEGER DEFAULT 0 CHECK (spicy_level >= 0 AND spicy_level <= 5),
        vegetarian BOOLEAN DEFAULT false,
        featured BOOLEAN DEFAULT false,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE gallery_items (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        src TEXT NOT NULL,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE reservations (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Criar índices
    console.log('⚡ Criando índices...');
    await pool.query('CREATE INDEX idx_menu_items_category ON menu_items(category_id);');
    await pool.query('CREATE INDEX idx_menu_items_featured ON menu_items(featured) WHERE featured = true;');
    await pool.query('CREATE INDEX idx_menu_items_active ON menu_items(active) WHERE active = true;');
    await pool.query('CREATE INDEX idx_gallery_items_active ON gallery_items(active) WHERE active = true;');
    await pool.query('CREATE INDEX idx_reservations_status ON reservations(status);');
    
    // Inserir dados
    console.log('👤 Criando administrador...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, 'admin']
    );
    
    console.log('🍽️ Inserindo categorias...');
    await pool.query(`
      INSERT INTO menu_categories (name, description, "order") VALUES 
      ('Tacos', 'Autênticos tacos mexicanos feitos na hora', 1),
      ('Burritos', 'Burritos gigantes com ingredientes frescos', 2),
      ('Quesadillas', 'Quesadillas crocantes com queijo derretido', 3),
      ('Bebidas', 'Bebidas tradicionais mexicanas', 4),
      ('Sobremesas', 'Doces tradicionais mexicanos', 5),
      ('Entradas', 'Aperitivos deliciosos', 6)
    `);
    
    console.log('🌮 Inserindo menu completo...');
    await pool.query(`
      INSERT INTO menu_items (name, description, price, category_id, spicy_level, vegetarian, featured, "order", active, image) VALUES 
      ('Taco de Carnitas', 'Carne de porco desfiada com cebola roxa e coentro fresco', 450, 1, 2, false, true, 1, true, '/images/menu/taco-carnitas.jpg'),
      ('Taco de Pollo', 'Frango grelhado marinado com alface e molho chipotle', 400, 1, 1, false, false, 2, true, '/images/menu/taco-pollo.jpg'),
      ('Taco de Carne Asada', 'Carne bovina grelhada com guacamole e pico de gallo', 480, 1, 3, false, true, 3, true, '/images/menu/taco-carne.jpg'),
      ('Taco Vegetariano', 'Vegetais grelhados, feijão preto e abacate', 380, 1, 1, true, false, 4, true, '/images/menu/taco-veggie.jpg'),
      ('Burrito Supremo', 'Carne, feijão, arroz, queijo e molhos especiais', 850, 2, 2, false, true, 1, true, '/images/menu/burrito-supremo.jpg'),
      ('Burrito de Frango', 'Frango temperado, arroz, feijão e queijo', 780, 2, 1, false, false, 2, true, '/images/menu/burrito-frango.jpg'),
      ('Burrito Vegetariano', 'Feijão preto, arroz integral e vegetais', 720, 2, 1, true, false, 3, true, '/images/menu/burrito-veggie.jpg'),
      ('Quesadilla de Queijo', 'Mistura especial de queijos mexicanos', 650, 3, 0, true, false, 1, true, '/images/menu/quesadilla-queijo.jpg'),
      ('Quesadilla de Frango', 'Frango temperado com queijo e jalapeños', 720, 3, 2, false, false, 2, true, '/images/menu/quesadilla-frango.jpg'),
      ('Quesadilla Suprema', 'Carne, queijo, pimentões e cebola', 780, 3, 2, false, true, 3, true, '/images/menu/quesadilla-suprema.jpg'),
      ('Horchata Tradicional', 'Bebida cremosa de arroz com canela', 280, 4, 0, true, false, 1, true, '/images/menu/horchata.jpg'),
      ('Agua de Jamaica', 'Refrescante chá de hibisco', 220, 4, 0, true, false, 2, true, '/images/menu/jamaica.jpg'),
      ('Margarita Clássica', 'Tequila premium, limão fresco e triple sec', 420, 4, 0, false, true, 3, true, '/images/menu/margarita.jpg'),
      ('Limonada Mexicana', 'Limão fresco com água mineral', 180, 4, 0, true, false, 4, true, '/images/menu/limonada.jpg'),
      ('Churros com Dulce', 'Churros crocantes com doce de leite', 320, 5, 0, true, true, 1, true, '/images/menu/churros.jpg'),
      ('Flan Mexicano', 'Pudim tradicional com calda de caramelo', 280, 5, 0, true, false, 2, true, '/images/menu/flan.jpg'),
      ('Tres Leches', 'Bolo encharcado nos três leites', 350, 5, 0, true, false, 3, true, '/images/menu/tres-leches.jpg'),
      ('Guacamole Fresco', 'Abacates maduros com tomate, cebola e coentro', 320, 6, 1, true, true, 1, true, '/images/menu/guacamole.jpg'),
      ('Nachos Supremos', 'Tortilla chips com queijo derretido e jalapeños', 380, 6, 2, false, false, 2, true, '/images/menu/nachos.jpg')
    `);
    
    console.log('🖼️ Configurando galeria...');
    await pool.query(`
      INSERT INTO gallery_items (title, description, src, "order", active) VALUES 
      ('Ambiente Aconchegante', 'Interior decorado com arte mexicana tradicional', '/images/gallery/interior-1.jpg', 1, true),
      ('Pratos Artesanais', 'Nossos pratos preparados com ingredientes frescos', '/images/gallery/food-1.jpg', 2, true),
      ('Tacos Tradicionais', 'Tortillas feitas na hora com recheios autênticos', '/images/gallery/tacos-1.jpg', 3, true),
      ('Guacamole na Mesa', 'Guacamole preparado na sua mesa', '/images/gallery/guacamole-1.jpg', 4, true),
      ('Vista Panorâmica', 'Terraço com vista da cidade', '/images/gallery/terrace-1.jpg', 5, true),
      ('Chef Especializado', 'Nossa equipe expert em culinária mexicana', '/images/gallery/chef-1.jpg', 6, true),
      ('Bar Premium', 'Seleção de tequilas e coquetéis', '/images/gallery/bar-1.jpg', 7, true),
      ('Eventos Especiais', 'Espaço ideal para celebrações', '/images/gallery/events-1.jpg', 8, true)
    `);
    
    // Verificar dados criados
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM menu_categories) as categories,
        (SELECT COUNT(*) FROM menu_items) as menu_items,
        (SELECT COUNT(*) FROM gallery_items) as gallery_items
    `);
    
    console.log('📊 Migração concluída:');
    console.log(`   👥 Usuários: ${stats.rows[0].users}`);
    console.log(`   📂 Categorias: ${stats.rows[0].categories}`);
    console.log(`   🍽️ Menu: ${stats.rows[0].menu_items} itens`);
    console.log(`   🖼️ Galeria: ${stats.rows[0].gallery_items} imagens`);
    
    console.log('🎉 Supabase configurado com sucesso!');
    console.log('🔑 Credenciais admin: username=admin, password=admin123');
    
    // Salvar URL funcionando
    console.log('📝 URL Supabase funcionando confirmada');
    
    return supabaseUrl;
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Possíveis soluções:');
      console.log('   - Verificar se o projeto Supabase está ativo');
      console.log('   - Confirmar se a URL está correta');
      console.log('   - Tentar reiniciar o projeto no painel Supabase');
    }
    
    throw error;
  } finally {
    await pool.end();
  }
}

testAndMigrateSupabase()
  .then((url) => {
    console.log('✅ Migração completa para Supabase finalizada');
    console.log('🔗 URL configurada e funcionando');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na migração:', error.message);
    process.exit(1);
  });