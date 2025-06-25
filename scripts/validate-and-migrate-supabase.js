import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function validateSupabaseUrl(url) {
  console.log('🔍 Validando URL do Supabase...');
  
  // Verificações básicas da URL
  if (!url) {
    throw new Error('URL não fornecida');
  }
  
  if (!url.startsWith('postgresql://')) {
    throw new Error('URL deve começar com postgresql://');
  }
  
  if (!url.includes('supabase.co') && !url.includes('supabase.com')) {
    throw new Error('URL deve conter supabase.co ou supabase.com');
  }
  
  if (url.includes('[YOUR-PASSWORD]')) {
    throw new Error('Substitua [YOUR-PASSWORD] pela senha real do banco');
  }
  
  console.log('✅ Formato da URL válido');
  return true;
}

async function testConnection(url) {
  console.log('🔗 Testando conexão...');
  
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000,
  });
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as server_time, version() as version');
    
    console.log('✅ Conexão estabelecida com sucesso');
    console.log(`⏰ Hora do servidor: ${result.rows[0].server_time}`);
    console.log(`🏗️ Versão PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function migrateToSupabase(url) {
  console.log('🚀 Iniciando migração completa para Supabase...');
  
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  
  try {
    // Limpar estrutura anterior se existir
    console.log('🧹 Preparando banco de dados...');
    
    await pool.query('DROP TABLE IF EXISTS reservations CASCADE;');
    await pool.query('DROP TABLE IF EXISTS gallery_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_categories CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    
    // Criar extensões necessárias
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // Criar tabelas otimizadas para Supabase
    console.log('📋 Criando estrutura de tabelas...');
    
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
    
    // Criar índices para performance
    console.log('⚡ Criando índices de performance...');
    
    await pool.query('CREATE INDEX idx_menu_items_category ON menu_items(category_id);');
    await pool.query('CREATE INDEX idx_menu_items_featured ON menu_items(featured) WHERE featured = true;');
    await pool.query('CREATE INDEX idx_menu_items_active ON menu_items(active) WHERE active = true;');
    await pool.query('CREATE INDEX idx_gallery_items_active ON gallery_items(active) WHERE active = true;');
    await pool.query('CREATE INDEX idx_reservations_status ON reservations(status);');
    await pool.query('CREATE INDEX idx_reservations_date ON reservations(date);');
    
    // Inserir dados iniciais
    console.log('👤 Criando usuário administrador...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, 'admin']
    );
    
    console.log('🍽️ Inserindo categorias do menu...');
    const categoriesResult = await pool.query(`
      INSERT INTO menu_categories (name, description, "order") VALUES 
      ('Tacos', 'Nossos famosos tacos mexicanos autênticos', 1),
      ('Burritos', 'Burritos grandes e saborosos feitos na hora', 2),
      ('Quesadillas', 'Quesadillas crocantes e deliciosas com queijo derretido', 3),
      ('Bebidas', 'Refrescos e bebidas tradicionais mexicanas', 4),
      ('Sobremesas', 'Doces tradicionais mexicanos para finalizar', 5)
      RETURNING id, name;
    `);
    
    console.log('🌮 Inserindo itens do menu completo...');
    const menuResult = await pool.query(`
      INSERT INTO menu_items (name, description, price, category_id, spicy_level, vegetarian, featured, "order", active, image) VALUES 
      -- Tacos
      ('Taco de Carnitas', 'Taco tradicional com carne de porco desfiada, cebola roxa, coentro fresco e molho verde', 450, 1, 2, false, true, 1, true, '/images/menu/taco-carnitas.jpg'),
      ('Taco de Pollo', 'Taco com frango grelhado marinado, alface americana, tomate e molho chipotle', 400, 1, 1, false, false, 2, true, '/images/menu/taco-pollo.jpg'),
      ('Taco de Carne Asada', 'Taco com carne bovina grelhada, guacamole, pico de gallo e queijo cotija', 480, 1, 2, false, true, 3, true, '/images/menu/taco-carne-asada.jpg'),
      ('Taco Vegetariano', 'Taco com vegetais grelhados, feijão preto, abacate e molho de coentro', 380, 1, 1, true, false, 4, true, '/images/menu/taco-vegetariano.jpg'),
      
      -- Burritos
      ('Burrito Supremo', 'Burrito gigante com carne, feijão refrito, arroz mexicano, queijo e molhos especiais', 850, 2, 2, false, true, 1, true, '/images/menu/burrito-supremo.jpg'),
      ('Burrito de Frango', 'Burrito com frango temperado, arroz, feijão, queijo cheddar e molho ranch', 780, 2, 1, false, false, 2, true, '/images/menu/burrito-frango.jpg'),
      ('Burrito Vegetariano', 'Burrito com feijão preto, arroz integral, vegetais grelhados e guacamole', 720, 2, 1, true, false, 3, true, '/images/menu/burrito-vegetariano.jpg'),
      
      -- Quesadillas
      ('Quesadilla de Queijo', 'Quesadilla clássica com mistura de queijos mexicanos derretidos', 650, 3, 0, true, false, 1, true, '/images/menu/quesadilla-queijo.jpg'),
      ('Quesadilla de Frango', 'Quesadilla com frango temperado, queijo monterey jack e jalapeños', 720, 3, 2, false, false, 2, true, '/images/menu/quesadilla-frango.jpg'),
      ('Quesadilla Suprema', 'Quesadilla com carne, queijo, pimentões e cebola caramelizada', 780, 3, 2, false, true, 3, true, '/images/menu/quesadilla-suprema.jpg'),
      
      -- Bebidas
      ('Horchata', 'Bebida tradicional mexicana de arroz com canela, baunilha e leite condensado', 280, 4, 0, true, false, 1, true, '/images/menu/horchata.jpg'),
      ('Agua de Jamaica', 'Refrescante bebida de hibisco com toque de limão e açúcar mascavo', 220, 4, 0, true, false, 2, true, '/images/menu/agua-jamaica.jpg'),
      ('Margarita Clássica', 'Coquetel tradicional mexicano com tequila, limão e triple sec', 420, 4, 0, false, true, 3, true, '/images/menu/margarita.jpg'),
      ('Limonada Mexicana', 'Limonada refrescante com água mineral, limão fresco e sal marinho', 180, 4, 0, true, false, 4, true, '/images/menu/limonada-mexicana.jpg'),
      
      -- Sobremesas
      ('Churros com Doce de Leite', 'Churros crocantes polvilhados com açúcar e canela, servidos com doce de leite', 320, 5, 0, true, true, 1, true, '/images/menu/churros.jpg'),
      ('Flan Mexicano', 'Pudim tradicional mexicano com calda de caramelo e toque de baunilha', 280, 5, 0, true, false, 2, true, '/images/menu/flan.jpg')
      RETURNING id, name;
    `);
    
    console.log('🖼️ Inserindo galeria de imagens...');
    const galleryResult = await pool.query(`
      INSERT INTO gallery_items (title, description, src, "order", active) VALUES 
      ('Ambiente Aconchegante', 'Interior do restaurante com decoração mexicana tradicional e iluminação acolhedora', '/images/gallery/interior-1.jpg', 1, true),
      ('Pratos Especiais', 'Nossos deliciosos pratos mexicanos preparados com ingredientes frescos', '/images/gallery/food-1.jpg', 2, true),
      ('Tacos Tradicionais', 'Tacos preparados na hora com tortillas artesanais e recheios autênticos', '/images/gallery/tacos-1.jpg', 3, true),
      ('Guacamole Fresco', 'Guacamole preparado na mesa com abacates maduros e temperos especiais', '/images/gallery/guacamole-1.jpg', 4, true),
      ('Área Externa', 'Terraço com vista panorâmica da cidade, perfeito para jantares românticos', '/images/gallery/exterior-1.jpg', 5, true),
      ('Equipe Especializada', 'Nossa equipe de chefs especializados em culinária mexicana autêntica', '/images/gallery/chef-1.jpg', 6, true),
      ('Bar de Drinks', 'Bar completo com ampla seleção de tequilas e coquetéis mexicanos', '/images/gallery/bar-1.jpg', 7, true),
      ('Eventos Especiais', 'Espaço preparado para comemorações e eventos especiais', '/images/gallery/eventos-1.jpg', 8, true)
      RETURNING id, title;
    `);
    
    // Verificar estatísticas finais
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM menu_categories) as categories,
        (SELECT COUNT(*) FROM menu_items) as menu_items,
        (SELECT COUNT(*) FROM gallery_items) as gallery_items
    `);
    
    console.log('📊 Migração concluída - Estatísticas:');
    console.log(`   👥 Usuários: ${stats.rows[0].users}`);
    console.log(`   📂 Categorias: ${stats.rows[0].categories}`);
    console.log(`   🍽️ Itens do menu: ${stats.rows[0].menu_items}`);
    console.log(`   🖼️ Itens da galeria: ${stats.rows[0].gallery_items}`);
    
    console.log('🎉 Migração para Supabase concluída com sucesso!');
    console.log('🔑 Credenciais do administrador: username: admin, password: admin123');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function validateAndMigrate() {
  const url = process.env.DATABASE_URL;
  
  try {
    // Validar formato da URL
    await validateSupabaseUrl(url);
    
    // Testar conexão
    await testConnection(url);
    
    // Executar migração completa
    await migrateToSupabase(url);
    
    console.log('✅ Processo completo finalizado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('💥 Erro no processo:', error.message);
    console.error('\n🔧 Soluções possíveis:');
    console.error('   - Verifique se a URL está correta');
    console.error('   - Confirme se o projeto Supabase está ativo');
    console.error('   - Teste a senha na URL');
    console.error('   - Verifique a conectividade de rede');
    
    return false;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAndMigrate()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

export default validateAndMigrate;