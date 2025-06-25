import { Pool } from 'pg';

async function diagnoseSupabaseConnection() {
  const url = process.env.DATABASE_URL;
  console.log('Diagnosticando conexão Supabase...');
  
  // Extrair componentes da URL para análise
  try {
    const urlObj = new URL(url);
    console.log('Host:', urlObj.hostname);
    console.log('Porta:', urlObj.port);
    console.log('Database:', urlObj.pathname.slice(1));
    console.log('Username:', urlObj.username);
    
    // Tentar diferentes configurações de conexão
    const configs = [
      {
        name: 'Configuração 1 - Porta 5432 com SSL',
        config: {
          connectionString: url,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 20000,
        }
      },
      {
        name: 'Configuração 2 - Porta 6543 (pooler)',
        config: {
          connectionString: url.replace(':5432', ':6543'),
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 20000,
        }
      },
      {
        name: 'Configuração 3 - Sem SSL',
        config: {
          connectionString: url,
          ssl: false,
          connectionTimeoutMillis: 20000,
        }
      }
    ];
    
    for (const { name, config } of configs) {
      console.log(`\nTestando ${name}...`);
      const pool = new Pool(config);
      
      try {
        const client = await pool.connect();
        console.log('✅ Sucesso!');
        const result = await client.query('SELECT NOW()');
        console.log('Tempo do servidor:', result.rows[0].now);
        client.release();
        await pool.end();
        
        // Se chegou até aqui, a configuração funciona
        return config;
      } catch (error) {
        console.log('❌ Falhou:', error.message);
        await pool.end();
      }
    }
    
    throw new Error('Nenhuma configuração funcionou');
    
  } catch (error) {
    console.error('Erro no diagnóstico:', error.message);
    throw error;
  }
}

diagnoseSupabaseConnection()
  .then((workingConfig) => {
    console.log('\n🎉 Configuração funcionando encontrada!');
    console.log('Use esta configuração para conectar:', JSON.stringify(workingConfig, null, 2));
  })
  .catch(() => {
    console.log('\n💡 Possíveis soluções:');
    console.log('1. Verificar se o projeto Supabase está pausado');
    console.log('2. Verificar se a URL está correta no painel Supabase');
    console.log('3. Tentar reiniciar o projeto no Supabase');
    console.log('4. Criar um novo projeto Supabase');
    process.exit(1);
  });