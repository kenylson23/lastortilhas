import { Pool } from 'pg';

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada');
    return false;
  }
  
  console.log('📝 DATABASE_URL configurada');
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false 
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  try {
    console.log('🔗 Tentando conectar...');
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query simples
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Hora do servidor:', result.rows[0].current_time);
    
    client.release();
    return true;
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('🔧 Detalhes do erro:', error.code || 'N/A');
    return false;
  } finally {
    await pool.end();
  }
}

testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log('🎉 Teste de conexão concluído com sucesso');
      process.exit(0);
    } else {
      console.log('💥 Teste de conexão falhou');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
  });