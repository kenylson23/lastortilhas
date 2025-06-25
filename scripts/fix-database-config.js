import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function fixDatabaseConfig() {
  console.log('Configurando banco de dados com a conexão correta...');
  
  // Tentar diferentes configurações até encontrar uma que funcione
  const configs = [
    // Neon com SSL require
    {
      name: 'Neon SSL Required',
      config: {
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: { require: true, rejectUnauthorized: false },
        max: 10,
      }
    },
    // Neon com SSL prefer
    {
      name: 'Neon SSL Prefer',
      config: {
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: { prefer: true, rejectUnauthorized: false },
        max: 10,
      }
    },
    // Connection string com SSL
    {
      name: 'Connection String SSL',
      config: {
        connectionString: `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=require`,
        max: 10,
      }
    }
  ];
  
  let workingPool = null;
  let workingConfig = null;
  
  for (const { name, config } of configs) {
    console.log(`Testando ${name}...`);
    const pool = new Pool(config);
    
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      console.log(`✅ ${name} funcionou!`);
      workingPool = pool;
      workingConfig = config;
      break;
    } catch (error) {
      console.log(`❌ ${name} falhou: ${error.message}`);
      await pool.end();
    }
  }
  
  if (!workingPool) {
    throw new Error('Nenhuma configuração de banco funcionou');
  }
  
  try {
    console.log('Configurando estrutura do banco...');
    
    // Limpar e recriar estrutura
    await workingPool.query('DROP TABLE IF EXISTS reservations CASCADE;');
    await workingPool.query('DROP TABLE IF EXISTS gallery_items CASCADE;');
    await workingPool.query('DROP TABLE IF EXISTS menu_items CASCADE;');
    await workingPool.query('DROP TABLE IF EXISTS menu_categories CASCADE;');
    await workingPool.query('DROP TABLE IF EXISTS users CASCADE;');
    
    // Criar tabelas
    await workingPool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await workingPool.query(`
      CREATE TABLE menu_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await workingPool.query(`
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
    
    await workingPool.query(`
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
    
    await workingPool.query(`
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
    
    // Criar admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await workingPool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, 'admin']
    );
    
    // Inserir categorias
    await workingPool.query(`
      INSERT INTO menu_categories (name, description, "order") VALUES 
      ('Tacos', 'Autênticos tacos mexicanos feitos na hora', 1),
      ('Burritos', 'Burritos gigantes com ingredientes frescos', 2),
      ('Quesadillas', 'Quesadillas crocantes com queijo derretido', 3),
      ('Bebidas', 'Bebidas tradicionais e refrescantes mexicanas', 4),
      ('Sobremesas', 'Doces tradicionais mexicanos irresistíveis', 5)
    `);
    
    // Inserir menu completo
    await workingPool.query(`
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
      ('Agua de Jamaica', 'Refrescante chá de hibisco com limão', 220, 4, 0, true, false, 2, true, '/images/menu/jamaica.jpg'),
      ('Margarita Clássica', 'Tequila premium, limão fresco e triple sec', 420, 4, 0, false, true, 3, true, '/images/menu/margarita.jpg'),
      ('Limonada Mexicana', 'Limão fresco com água mineral', 180, 4, 0, true, false, 4, true, '/images/menu/limonada.jpg'),
      ('Churros com Dulce', 'Churros crocantes com doce de leite', 320, 5, 0, true, true, 1, true, '/images/menu/churros.jpg'),
      ('Flan Mexicano', 'Pudim tradicional com calda de caramelo', 280, 5, 0, true, false, 2, true, '/images/menu/flan.jpg'),
      ('Tres Leches', 'Bolo encharcado nos três leites', 350, 5, 0, true, false, 3, true, '/images/menu/tres-leches.jpg')
    `);
    
    // Inserir galeria
    await workingPool.query(`
      INSERT INTO gallery_items (title, description, src, "order", active) VALUES 
      ('Ambiente Aconchegante', 'Interior decorado com arte mexicana tradicional', '/images/gallery/interior-1.jpg', 1, true),
      ('Pratos Artesanais', 'Nossos pratos preparados com ingredientes frescos', '/images/gallery/food-1.jpg', 2, true),
      ('Tacos Tradicionais', 'Tortillas feitas na hora com recheios autênticos', '/images/gallery/tacos-1.jpg', 3, true),
      ('Guacamole Fresh', 'Guacamole preparado na mesa com abacates maduros', '/images/gallery/guacamole-1.jpg', 4, true),
      ('Vista Panorâmica', 'Terraço com vista da cidade para jantares especiais', '/images/gallery/terrace-1.jpg', 5, true),
      ('Chef Especializado', 'Nossa equipe expert em culinária mexicana', '/images/gallery/chef-1.jpg', 6, true),
      ('Bar Completo', 'Seleção premium de tequilas e mezcais', '/images/gallery/bar-1.jpg', 7, true),
      ('Eventos Especiais', 'Espaço ideal para comemorações', '/images/gallery/events-1.jpg', 8, true)
    `);
    
    console.log('Banco configurado com sucesso!');
    console.log('Admin: username=admin, password=admin123');
    
    // Salvar configuração que funcionou
    const connectionString = workingConfig.connectionString || 
      `postgresql://${workingConfig.user}:${workingConfig.password}@${workingConfig.host}:${workingConfig.port}/${workingConfig.database}?sslmode=require`;
    
    console.log('URL de conexão funcionando:', connectionString.replace(/:[^:]*@/, ':****@'));
    
    return connectionString;
    
  } catch (error) {
    console.error('Erro na configuração:', error.message);
    throw error;
  } finally {
    if (workingPool) {
      await workingPool.end();
    }
  }
}

fixDatabaseConfig()
  .then((url) => {
    console.log('Configuração completa. Use esta URL:', url.replace(/:[^:]*@/, ':****@'));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Falhou:', error.message);
    process.exit(1);
  });