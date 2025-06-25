import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function completeSupabaseMigration() {
  console.log('🚀 Iniciando migração completa para Supabase...');
  
  // URL do Supabase que funciona
  const WORKING_SUPABASE_URL = "postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:6543/postgres";
  
  const pool = new Pool({
    connectionString: WORKING_SUPABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('🔍 Testando conexão Supabase...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão Supabase estabelecida com sucesso!');

    // Verificar se as tabelas existem
    console.log('🔍 Verificando estrutura do banco...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Tabelas encontradas:', existingTables);
    
    // Criar tabelas se não existirem
    const requiredTables = ['users', 'menu_categories', 'menu_items', 'gallery_items', 'reservations'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('📝 Criando tabelas em falta:', missingTables);
      
      // Criar tabelas
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS menu_categories (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          "order" INTEGER DEFAULT 0,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS menu_items (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price INTEGER NOT NULL,
          image VARCHAR(500),
          category_id BIGINT REFERENCES menu_categories(id) ON DELETE CASCADE,
          spicy_level INTEGER DEFAULT 0,
          vegetarian BOOLEAN DEFAULT false,
          featured BOOLEAN DEFAULT false,
          available BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS gallery_items (
          id BIGSERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          src VARCHAR(500) NOT NULL,
          "order" INTEGER DEFAULT 0,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS reservations (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          guests INTEGER NOT NULL,
          message TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      console.log('✅ Tabelas criadas com sucesso!');
    }

    // Verificar se há dados nas tabelas
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const categoryCount = await pool.query('SELECT COUNT(*) FROM menu_categories');
    const menuCount = await pool.query('SELECT COUNT(*) FROM menu_items');
    const galleryCount = await pool.query('SELECT COUNT(*) FROM gallery_items');

    console.log('📊 Dados existentes:');
    console.log(`   - Usuários: ${userCount.rows[0].count}`);
    console.log(`   - Categorias: ${categoryCount.rows[0].count}`);
    console.log(`   - Itens do menu: ${menuCount.rows[0].count}`);
    console.log(`   - Galeria: ${galleryCount.rows[0].count}`);

    // Se não houver dados, inserir dados de exemplo
    if (userCount.rows[0].count === '0') {
      console.log('📝 Inserindo dados de exemplo...');
      
      // Inserir usuário admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(`
        INSERT INTO users (username, password, email, role) 
        VALUES ('admin', $1, 'admin@lastortillas.com', 'admin')
      `, [hashedPassword]);

      // Inserir categorias
      await pool.query(`
        INSERT INTO menu_categories (name, description, "order", active) VALUES
        ('Tacos', 'Deliciosos tacos mexicanos', 1, true),
        ('Quesadillas', 'Quesadillas tradicionais', 2, true),
        ('Nachos', 'Nachos crocantes', 3, true),
        ('Bebidas', 'Refrescos e bebidas', 4, true)
      `);

      // Inserir itens do menu
      await pool.query(`
        INSERT INTO menu_items (name, description, price, image, category_id, spicy_level, vegetarian, featured, available) VALUES
        ('Taco de Carne', 'Taco tradicional com carne bovina', 850, '/images/menu/taco-carne.jpg', 1, 2, false, true, true),
        ('Taco de Frango', 'Taco com frango grelhado', 800, '/images/menu/taco-frango.jpg', 1, 1, false, true, true),
        ('Taco Vegetariano', 'Taco com vegetais frescos', 750, '/images/menu/taco-vegetariano.jpg', 1, 0, true, false, true),
        ('Quesadilla Clássica', 'Quesadilla com queijo derretido', 900, '/images/menu/quesadilla-classica.jpg', 2, 0, true, true, true),
        ('Quesadilla de Frango', 'Quesadilla com frango e queijo', 1000, '/images/menu/quesadilla-frango.jpg', 2, 1, false, false, true),
        ('Nachos Supreme', 'Nachos com todos os complementos', 1200, '/images/menu/nachos-supreme.jpg', 3, 2, false, true, true),
        ('Nachos Vegetarianos', 'Nachos com guacamole', 1000, '/images/menu/nachos-vegetarianos.jpg', 3, 1, true, false, true),
        ('Coca-Cola', 'Refrigerante gelado', 300, '/images/menu/coca-cola.jpg', 4, 0, true, false, true),
        ('Água', 'Água mineral', 200, '/images/menu/agua.jpg', 4, 0, true, false, true),
        ('Suco Natural', 'Suco de frutas frescas', 400, '/images/menu/suco-natural.jpg', 4, 0, true, false, true)
      `);

      // Inserir itens da galeria
      await pool.query(`
        INSERT INTO gallery_items (title, description, src, "order", active) VALUES
        ('Ambiente Acolhedor', 'Interior do restaurante', '/images/gallery/ambiente1.jpg', 1, true),
        ('Tacos Frescos', 'Nossos tacos especiais', '/images/gallery/tacos.jpg', 2, true),
        ('Mesa Preparada', 'Mesa pronta para os clientes', '/images/gallery/mesa.jpg', 3, true),
        ('Cozinha', 'Nossa cozinha em ação', '/images/gallery/cozinha.jpg', 4, true),
        ('Equipe', 'Nossa equipe dedicada', '/images/gallery/equipe.jpg', 5, true),
        ('Exterior', 'Fachada do restaurante', '/images/gallery/exterior.jpg', 6, true)
      `);

      console.log('✅ Dados de exemplo inseridos com sucesso!');
    }

    console.log('🎉 Migração para Supabase concluída com sucesso!');
    console.log('🔗 URL da base de dados:', WORKING_SUPABASE_URL);
    console.log('👤 Usuário admin: username=admin, password=admin123');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

completeSupabaseMigration()
  .then(() => {
    console.log('✅ Migração concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });

export { completeSupabaseMigration };