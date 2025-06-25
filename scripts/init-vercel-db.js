import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';

// WebSocket não é necessário no Vercel
neonConfig.webSocketConstructor = undefined;

async function initializeDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔧 Inicializando banco de dados para Vercel...');
    
    // Criar tabelas se não existirem
    console.log('📋 Criando tabelas...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        category_id INTEGER REFERENCES menu_categories(id),
        image TEXT,
        active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        spicy_level INTEGER DEFAULT 0,
        vegetarian BOOLEAN DEFAULT false,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
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
      CREATE TABLE IF NOT EXISTS reservations (
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
    
    // Verificar se admin existe
    const adminCheck = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    
    if (adminCheck.rows.length === 0) {
      console.log('👤 Criando usuário admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
    }
    
    // Verificar se categorias existem
    const categoriesCheck = await pool.query('SELECT COUNT(*) FROM menu_categories');
    
    if (parseInt(categoriesCheck.rows[0].count) === 0) {
      console.log('🍽️ Adicionando categorias e itens do menu...');
      
      // Inserir categorias
      await pool.query(`
        INSERT INTO menu_categories (name, description, "order", active) VALUES 
        ('Entradas', 'Deliciosos aperitivos para começar sua refeição', 1, true),
        ('Pratos Principais', 'Nossos pratos tradicionais mexicanos', 2, true),
        ('Bebidas', 'Refrescantes bebidas mexicanas', 3, true),
        ('Sobremesas', 'Doces tradicionais mexicanos', 4, true)
      `);
      
      // Inserir itens do menu
      await pool.query(`
        INSERT INTO menu_items (name, description, price, category_id, active, featured, spicy_level, vegetarian, "order", image) VALUES 
        ('Guacamole', 'Abacate fresco com tomate, cebola e coentro', 1599, 1, true, true, 1, true, 1, '/images/menu/guacamole.jpg'),
        ('Nachos Supremos', 'Nachos com queijo derretido, jalapeños e molho', 1899, 1, true, false, 2, false, 2, '/images/menu/nachos-supremos.jpg'),
        ('Quesadillas', 'Tortillas recheadas com queijo e temperos', 1299, 1, true, false, 1, true, 3, '/images/menu/quesadillas.jpg'),
        ('Tacos de Carne', 'Três tacos tradicionais com carne temperada', 2499, 2, true, true, 2, false, 1, '/images/menu/tacos-de-carne.jpg'),
        ('Burrito Especial', 'Burrito grande com carne, feijão e queijo', 2299, 2, true, true, 2, false, 2, '/images/menu/burrito-especial.jpg'),
        ('Enchiladas', 'Tortillas recheadas com molho especial', 2699, 2, true, false, 3, false, 3, '/images/menu/enchiladas.jpg'),
        ('Fajitas de Frango', 'Frango grelhado com pimentões e cebola', 2899, 2, true, true, 2, false, 4, '/images/menu/fajitas-de-frango.jpg'),
        ('Agua Fresca', 'Bebida refrescante de frutas naturais', 899, 3, true, false, 0, true, 1, '/images/menu/agua-fresca.jpg'),
        ('Horchata', 'Bebida tradicional de arroz e canela', 999, 3, true, false, 0, true, 2, '/images/menu/horchata.jpg'),
        ('Margarita', 'Coquetel tradicional mexicano', 1699, 3, true, false, 0, false, 3, '/images/menu/margarita.jpg'),
        ('Churros', 'Doces fritos com açúcar e canela', 1299, 4, true, true, 0, true, 1, '/images/menu/churros.jpg'),
        ('Flan', 'Pudim tradicional mexicano', 1499, 4, true, false, 0, true, 2, '/images/menu/flan.jpg')
      `);
    }
    
    // Verificar se galeria existe
    const galleryCheck = await pool.query('SELECT COUNT(*) FROM gallery_items');
    
    if (parseInt(galleryCheck.rows[0].count) === 0) {
      console.log('🖼️ Adicionando itens da galeria...');
      await pool.query(`
        INSERT INTO gallery_items (title, description, src, "order", active) VALUES 
        ('Ambiente Aconchegante', 'Interior do restaurante com decoração mexicana tradicional', '/images/gallery/interior-1.jpg', 1, true),
        ('Pratos Especiais', 'Nossos deliciosos pratos mexicanos frescos', '/images/gallery/food-1.jpg', 2, true),
        ('Tacos Tradicionais', 'Tacos preparados com ingredientes frescos', '/images/gallery/tacos-1.jpg', 3, true),
        ('Guacamole Fresco', 'Guacamole preparado na hora', '/images/gallery/guacamole-1.jpg', 4, true),
        ('Área Externa', 'Terraço com vista para a cidade', '/images/gallery/exterior-1.jpg', 5, true),
        ('Equipe Especializada', 'Nossa equipe preparando os melhores pratos', '/images/gallery/chef-1.jpg', 6, true)
      `);
    }
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('🔑 Admin criado: username: admin, password: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initializeDatabase;