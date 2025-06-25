import { Pool } from 'pg';

async function checkSupabaseStatus() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  
  try {
    console.log('📊 Verificando status do Supabase...\n');
    
    // Verificar tabelas existentes
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('✅ Tabelas encontradas:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Contar registros em cada tabela
    console.log('\n📊 Registros por tabela:');
    
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
    
    // Verificar usuário admin
    const admin = await client.query('SELECT username, role FROM users WHERE role = $1', ['admin']);
    console.log(`\n👤 Usuário admin: ${admin.rows.length > 0 ? '✅ Encontrado' : '❌ Não encontrado'}`);
    
    // Testar uma consulta complexa
    const menuTest = await client.query(`
      SELECT mi.name, mc.name as category 
      FROM menu_items mi 
      JOIN menu_categories mc ON mi.category_id = mc.id 
      LIMIT 3
    `);
    
    console.log('\n🍽️ Teste de consulta (menu com categoria):');
    menuTest.rows.forEach(row => console.log(`  - ${row.name} (${row.category})`));
    
    console.log('\n✅ Supabase funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar Supabase:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSupabaseStatus();