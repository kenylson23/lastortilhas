-- Script SQL para executar no SQL Editor do Supabase
-- Isso garante que as tabelas apareçam no dashboard

-- 1. Recriar tabelas com configurações apropriadas para o dashboard Supabase
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS gallery_items CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Criar tabelas na ordem correta (respeitando foreign keys)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE menu_categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
);

CREATE TABLE gallery_items (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    src TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
);

-- 3. Inserir dados iniciais
-- Usuário admin
INSERT INTO users (username, password, role) VALUES 
('admin', '$2b$10$rQZ5QXl.mKJ9YHf8YGH9v.Rt8LG9wX1vN3K6mL2wZ5X9oN8wV7wL2', 'admin');

-- Categorias do menu
INSERT INTO menu_categories (name, description, "order", active) VALUES 
('Entradas', 'Deliciosos aperitivos para começar sua refeição', 1, true),
('Pratos Principais', 'Nossos pratos tradicionais mexicanos', 2, true),
('Bebidas', 'Refrescantes bebidas mexicanas', 3, true),
('Sobremesas', 'Doces tradicionais mexicanos', 4, true);

-- Itens do menu
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
('Flan', 'Pudim tradicional mexicano', 1500, 4, true, false, 0, true, 2, '/images/menu/flan.jpg');

-- Itens da galeria
INSERT INTO gallery_items (title, description, src, "order", active) VALUES 
('Ambiente Aconchegante', 'Interior do restaurante com decoração mexicana tradicional', '/images/gallery/interior-1.jpg', 1, true),
('Pratos Especiais', 'Nossos deliciosos pratos mexicanos frescos', '/images/gallery/food-1.jpg', 2, true),
('Tacos Tradicionais', 'Tacos preparados com ingredientes frescos', '/images/gallery/tacos-1.jpg', 3, true),
('Guacamole Fresco', 'Guacamole preparado na hora', '/images/gallery/guacamole-1.jpg', 4, true),
('Área Externa', 'Terraço com vista para a cidade', '/images/gallery/exterior-1.jpg', 5, true),
('Equipe Especializada', 'Nossa equipe preparando os melhores pratos', '/images/gallery/chef-1.jpg', 6, true);