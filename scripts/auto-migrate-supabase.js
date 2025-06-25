import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function autoMigrateSupabase() {
  console.log('🚀 Iniciando migração automática para Supabase...');
  
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error('DATABASE_URL não configurada');
  }
  
  console.log('🔍 Validando conexão Supabase...');
  
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  
  try {
    // Testar conexão
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as server_time');
    console.log('✅ Conexão Supabase estabelecida');
    console.log(`⏰ Servidor: ${result.rows[0].server_time}`);
    client.release();
    
    // Preparar banco
    console.log('🧹 Preparando estrutura...');
    await pool.query('DROP TABLE IF EXISTS reservations CASCADE;');
    await pool.query('DROP TABLE IF EXISTS gallery_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_categories CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    
    // Criar extensões Supabase
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    
    // Criar tabelas otimizadas para Supabase
    console.log('📋 Criando estrutura otimizada...');
    
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
    
    // Criar índices de performance
    console.log('⚡ Criando índices...');
    await pool.query('CREATE INDEX idx_menu_items_category ON menu_items(category_id);');
    await pool.query('CREATE INDEX idx_menu_items_featured ON menu_items(featured) WHERE featured = true;');
    await pool.query('CREATE INDEX idx_menu_items_active ON menu_items(active) WHERE active = true;');
    await pool.query('CREATE INDEX idx_gallery_items_active ON gallery_items(active) WHERE active = true;');
    await pool.query('CREATE INDEX idx_reservations_status ON reservations(status);');
    await pool.query('CREATE INDEX idx_reservations_user ON reservations(user_id);');
    
    // Inserir dados
    console.log('👤 Criando administrador...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, 'admin']
    );
    
    console.log('🍽️ Inserindo menu completo...');
    const categoriesResult = await pool.query(`
      INSERT INTO menu_categories (name, description, "order") VALUES 
      ('Tacos', 'Autênticos tacos mexicanos feitos na hora com tortillas artesanais', 1),
      ('Burritos', 'Burritos gigantes recheados com ingredientes frescos e saborosos', 2),
      ('Quesadillas', 'Quesadillas crocantes com queijo derretido e recheios especiais', 3),
      ('Bebidas', 'Bebidas tradicionais mexicanas e refrescos naturais', 4),
      ('Sobremesas', 'Doces tradicionais mexicanos irresistíveis', 5),
      ('Entradas', 'Aperitivos deliciosos para começar sua experiência', 6)
      RETURNING id;
    `);
    
    await pool.query(`
      INSERT INTO menu_items (name, description, price, category_id, spicy_level, vegetarian, featured, "order", active, image) VALUES 
      ('Taco de Carnitas', 'Carne de porco desfiada temperada com especiarias mexicanas, cebola roxa e coentro fresco', 450, 1, 2, false, true, 1, true, '/images/menu/taco-carnitas.jpg'),
      ('Taco de Pollo', 'Frango grelhado marinado em adobo com alface crocante e molho chipotle caseiro', 400, 1, 1, false, false, 2, true, '/images/menu/taco-pollo.jpg'),
      ('Taco de Carne Asada', 'Carne bovina grelhada com guacamole fresco, pico de gallo e queijo cotija', 480, 1, 3, false, true, 3, true, '/images/menu/taco-carne.jpg'),
      ('Taco Vegetariano', 'Vegetais grelhados sazonais, feijão preto refrito, abacate e molho verde', 380, 1, 1, true, false, 4, true, '/images/menu/taco-veggie.jpg'),
      ('Taco de Pescado', 'Peixe fresco grelhado com repolho roxo e molho de lima especial', 420, 1, 1, false, false, 5, true, '/images/menu/taco-pescado.jpg'),
      
      ('Burrito Supremo', 'Carne temperada, feijão refrito, arroz mexicano, queijo derretido e molhos especiais', 850, 2, 2, false, true, 1, true, '/images/menu/burrito-supremo.jpg'),
      ('Burrito de Frango', 'Frango desfiado temperado, arroz, feijão, queijo cheddar e molho ranch', 780, 2, 1, false, false, 2, true, '/images/menu/burrito-frango.jpg'),
      ('Burrito Vegetariano', 'Feijão preto, arroz integral, vegetais grelhados, guacamole e queijo', 720, 2, 1, true, false, 3, true, '/images/menu/burrito-veggie.jpg'),
      ('Burrito de Carnitas', 'Carne de porco desfiada, arroz cilantro-lima, feijão pintos e salsa verde', 820, 2, 2, false, false, 4, true, '/images/menu/burrito-carnitas.jpg'),
      
      ('Quesadilla de Queijo', 'Mistura especial de queijos mexicanos derretidos em tortilla crocante', 650, 3, 0, true, false, 1, true, '/images/menu/quesadilla-queijo.jpg'),
      ('Quesadilla de Frango', 'Frango temperado com queijo monterey jack, jalapeños e cebola', 720, 3, 2, false, false, 2, true, '/images/menu/quesadilla-frango.jpg'),
      ('Quesadilla Suprema', 'Carne, queijo, pimentões coloridos e cebola caramelizada', 780, 3, 2, false, true, 3, true, '/images/menu/quesadilla-suprema.jpg'),
      ('Quesadilla de Camarão', 'Camarões grelhados com queijo oaxaca e pimenta poblano', 850, 3, 2, false, false, 4, true, '/images/menu/quesadilla-camarao.jpg'),
      
      ('Horchata Tradicional', 'Bebida cremosa de arroz com canela, baunilha e leite condensado', 280, 4, 0, true, false, 1, true, '/images/menu/horchata.jpg'),
      ('Agua de Jamaica', 'Refrescante chá gelado de hibisco com toque de limão', 220, 4, 0, true, false, 2, true, '/images/menu/jamaica.jpg'),
      ('Margarita Clássica', 'Tequila premium, cointreau, suco de limão fresco com borda de sal', 420, 4, 0, false, true, 3, true, '/images/menu/margarita.jpg'),
      ('Limonada Mexicana', 'Limão fresco espremido na hora com água mineral e sal marinho', 180, 4, 0, true, false, 4, true, '/images/menu/limonada.jpg'),
      ('Agua de Tamarindo', 'Bebida doce e azedinha feita com polpa de tamarindo', 250, 4, 0, true, false, 5, true, '/images/menu/tamarindo.jpg'),
      
      ('Churros com Dulce', 'Churros crocantes polvilhados com açúcar e canela, servidos com doce de leite', 320, 5, 0, true, true, 1, true, '/images/menu/churros.jpg'),
      ('Flan Mexicano', 'Pudim tradicional mexicano com calda de caramelo e toque de baunilha', 280, 5, 0, true, false, 2, true, '/images/menu/flan.jpg'),
      ('Tres Leches', 'Bolo embebido nos três leites com chantilly e frutas vermelhas', 350, 5, 0, true, false, 3, true, '/images/menu/tres-leches.jpg'),
      ('Sorvete Frito', 'Sorvete de baunilha empanado e frito, servido com mel e canela', 380, 5, 0, true, false, 4, true, '/images/menu/sorvete-frito.jpg'),
      
      ('Guacamole Fresco', 'Abacates maduros amassados com tomate, cebola, coentro e limão', 320, 6, 1, true, true, 1, true, '/images/menu/guacamole.jpg'),
      ('Nachos Supremos', 'Tortilla chips crocantes com queijo derretido, jalapeños e molhos', 380, 6, 2, false, false, 2, true, '/images/menu/nachos.jpg'),
      ('Jalapeños Poppers', 'Pimentões jalapeños recheados com queijo cream e empanados', 350, 6, 3, true, false, 3, true, '/images/menu/jalapenos.jpg')
    `);
    
    console.log('🖼️ Configurando galeria...');
    await pool.query(`
      INSERT INTO gallery_items (title, description, src, "order", active) VALUES 
      ('Ambiente Aconchegante', 'Interior decorado com arte mexicana autêntica e iluminação acolhedora', '/images/gallery/interior-1.jpg', 1, true),
      ('Pratos Artesanais', 'Nossos pratos preparados com ingredientes frescos e técnicas tradicionais', '/images/gallery/food-1.jpg', 2, true),
      ('Tacos Tradicionais', 'Tortillas feitas na hora com recheios autênticos e temperos especiais', '/images/gallery/tacos-1.jpg', 3, true),
      ('Guacamole na Mesa', 'Guacamole preparado na sua mesa com abacates perfeitamente maduros', '/images/gallery/guacamole-1.jpg', 4, true),
      ('Vista Panorâmica', 'Terraço com vista deslumbrante da cidade, ideal para ocasiões especiais', '/images/gallery/terrace-1.jpg', 5, true),
      ('Chef Especializado', 'Nossa equipe de chefs especializados em culinária mexicana autêntica', '/images/gallery/chef-1.jpg', 6, true),
      ('Bar Premium', 'Seleção cuidadosa de tequilas, mezcais e coquetéis tradicionais', '/images/gallery/bar-1.jpg', 7, true),
      ('Eventos Memoráveis', 'Espaço perfeito para celebrações, aniversários e eventos corporativos', '/images/gallery/events-1.jpg', 8, true),
      ('Cozinha Aberta', 'Veja nossos chefs preparando seus pratos na cozinha aberta', '/images/gallery/kitchen-1.jpg', 9, true),
      ('Mariachi ao Vivo', 'Música mexicana tradicional todas as sextas e sábados', '/images/gallery/mariachi-1.jpg', 10, true)
    `);
    
    // Verificar migração
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
    console.log('🔑 Admin: username=admin, password=admin123');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Auto-executar quando DATABASE_URL for configurada
if (process.env.DATABASE_URL) {
  autoMigrateSupabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  console.log('⏳ Aguardando DATABASE_URL...');
}