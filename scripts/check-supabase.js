import { Pool } from 'pg';

async function checkSupabaseStatus() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando conexão e estrutura do Supabase...\n');
    
    // Testar conexão básica
    const connectionTest = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Conexão OK: ${connectionTest.rows[0].current_time}`);
    
    // Verificar todos os schemas
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY schema_name
    `);
    
    console.log('\n📂 Schemas disponíveis:');
    schemas.rows.forEach(row => console.log(`  - ${row.schema_name}`));
    
    // Verificar tabelas em todos os schemas relevantes
    const allTables = await client.query(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'auth', 'storage', 'realtime')
      ORDER BY table_schema, table_name
    `);
    
    console.log('\n📋 Tabelas por schema:');
    const bySchema = {};
    allTables.rows.forEach(row => {
      if (!bySchema[row.table_schema]) bySchema[row.table_schema] = [];
      bySchema[row.table_schema].push(`${row.table_name} (${row.table_type})`);
    });
    
    Object.entries(bySchema).forEach(([schema, tables]) => {
      console.log(`\n  📂 ${schema}:`);
      tables.forEach(table => console.log(`    - ${table}`));
    });
    
    // Se não há tabelas no public, vamos criá-las
    const publicTables = allTables.rows.filter(row => row.table_schema === 'public');
    if (publicTables.length === 0) {
      console.log('\n⚠️ Nenhuma tabela encontrada no schema public');
      console.log('🔧 Executando criação das tabelas...');
      
      // Recriar as tabelas
      await recreateTables(client);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

async function recreateTables(client) {
  try {
    console.log('📋 Criando tabelas do zero...');
    
    // Criar tabelas uma por uma
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL
      );
    `);
    console.log('✅ Tabela users criada');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true
      );
    `);
    console.log('✅ Tabela menu_categories criada');
    
    await client.query(`
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
    console.log('✅ Tabela menu_items criada');
    
    await client.query(`
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
    console.log('✅ Tabela gallery_items criada');
    
    await client.query(`
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
    console.log('✅ Tabela reservations criada');
    
    console.log('🎯 Todas as tabelas criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    throw error;
  }
}

checkSupabaseStatus();