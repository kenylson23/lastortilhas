import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function completeLocalSetup() {
  console.log('Configurando banco de dados local...');
  
  // Usar a conexão local que sabemos que funciona
  const localUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=disable`;
  
  const pool = new Pool({
    connectionString: localUrl,
    max: 10,
  });
  
  try {
    // Testar conexão
    const client = await pool.connect();
    console.log('Conectado ao banco local');
    client.release();
    
    // Limpar estrutura anterior
    await pool.query('DROP TABLE IF EXISTS reservations CASCADE;');
    await pool.query('DROP TABLE IF EXISTS gallery_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_items CASCADE;');
    await pool.query('DROP TABLE IF EXISTS menu_categories CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    
    // Criar tabelas
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
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, 'admin']
    );
    
    // Inserir categorias
    const categoriesResult = await pool.query(`
      INSERT INTO menu_categories (name, description, "order") VALUES 
      ('Tacos', 'Autênticos tacos mexicanos feitos na hora', 1),
      ('Burritos', 'Burritos gigantes com ingredientes frescos', 2),
      ('Quesadillas', 'Quesadillas crocantes com queijo derretido', 3),
      ('Bebidas', 'Bebidas tradicionais e refrescantes mexicanas', 4),
      ('Sobremesas', 'Doces tradicionais mexicanos irresistíveis', 5)
      RETURNING id;
    `);
    
    // Inserir itens do menu completo
    await pool.query(`
      INSERT INTO menu_items (name, description, price, category_id, spicy_level, vegetarian, featured, "order", active, image) VALUES 
      ('Taco de Carnitas', 'Carne de porco desfiada com cebola roxa e coentro fresco em tortilla artesanal', 450, 1, 2, false, true, 1, true, '/images/menu/taco-carnitas.jpg'),
      ('Taco de Pollo', 'Frango grelhado marinado com alface, tomate e molho chipotle caseiro', 400, 1, 1, false, false, 2, true, '/images/menu/taco-pollo.jpg'),
      ('Taco de Carne Asada', 'Carne bovina grelhada com guacamole fresco e pico de gallo', 480, 1, 3, false, true, 3, true, '/images/menu/taco-carne.jpg'),
      ('Taco Vegetariano', 'Vegetais grelhados, feijão preto, abacate e molho verde', 380, 1, 1, true, false, 4, true, '/images/menu/taco-veggie.jpg'),
      
      ('Burrito Supremo', 'Carne, feijão refrito, arroz mexicano, queijo e molhos especiais', 850, 2, 2, false, true, 1, true, '/images/menu/burrito-supremo.jpg'),
      ('Burrito de Frango', 'Frango temperado, arroz, feijão e queijo cheddar derretido', 780, 2, 1, false, false, 2, true, '/images/menu/burrito-frango.jpg'),
      ('Burrito Vegetariano', 'Feijão preto, arroz integral, vegetais e guacamole caseiro', 720, 2, 1, true, false, 3, true, '/images/menu/burrito-veggie.jpg'),
      
      ('Quesadilla de Queijo', 'Mistura especial de queijos mexicanos derretidos', 650, 3, 0, true, false, 1, true, '/images/menu/quesadilla-queijo.jpg'),
      ('Quesadilla de Frango', 'Frango temperado com queijo monterey jack e jalapeños', 720, 3, 2, false, false, 2, true, '/images/menu/quesadilla-frango.jpg'),
      ('Quesadilla Suprema', 'Carne, queijo, pimentões e cebola caramelizada', 780, 3, 2, false, true, 3, true, '/images/menu/quesadilla-suprema.jpg'),
      
      ('Horchata Tradicional', 'Bebida cremosa de arroz com canela e baunilha', 280, 4, 0, true, false, 1, true, '/images/menu/horchata.jpg'),
      ('Agua de Jamaica', 'Refrescante chá de hibisco com limão', 220, 4, 0, true, false, 2, true, '/images/menu/jamaica.jpg'),
      ('Margarita Clássica', 'Tequila premium, limão fresco e triple sec', 420, 4, 0, false, true, 3, true, '/images/menu/margarita.jpg'),
      ('Limonada Mexicana', 'Limão fresco com água mineral e sal marinho', 180, 4, 0, true, false, 4, true, '/images/menu/limonada.jpg'),
      
      ('Churros com Dulce', 'Churros crocantes com doce de leite e canela', 320, 5, 0, true, true, 1, true, '/images/menu/churros.jpg'),
      ('Flan Mexicano', 'Pudim tradicional com calda de caramelo', 280, 5, 0, true, false, 2, true, '/images/menu/flan.jpg'),
      ('Tres Leches', 'Bolo encharcado nos três leites com chantilly', 350, 5, 0, true, false, 3, true, '/images/menu/tres-leches.jpg')
    `);
    
    // Inserir galeria
    await pool.query(`
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
    
    // Verificar dados
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM menu_categories) as categories,
        (SELECT COUNT(*) FROM menu_items) as menu_items,
        (SELECT COUNT(*) FROM gallery_items) as gallery_items
    `);
    
    console.log('Setup completo:');
    console.log(`Usuários: ${stats.rows[0].users}`);
    console.log(`Categorias: ${stats.rows[0].categories}`);
    console.log(`Itens do menu: ${stats.rows[0].menu_items}`);
    console.log(`Galeria: ${stats.rows[0].gallery_items}`);
    console.log('Admin: username=admin, password=admin123');
    
    return true;
    
  } catch (error) {
    console.error('Erro:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

completeLocalSetup()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));