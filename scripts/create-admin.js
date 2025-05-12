import { Pool, neonConfig } from '@neondatabase/serverless';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const scryptAsync = promisify(scrypt);

// Função para criar hash da senha
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

// Configuração da conexão com o banco de dados
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function createAdmin() {
  try {
    console.log('Criando usuário administrador...');
    
    // Dados do administrador
    const adminUsername = 'admin';
    const adminPassword = 'admin123'; // Senha temporária que deve ser alterada depois
    const adminRole = 'admin';
    
    // Verificar se o usuário já existe
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [adminUsername]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('O usuário administrador já existe.');
      return;
    }
    
    // Criar o hash da senha
    const hashedPassword = await hashPassword(adminPassword);
    
    // Inserir o usuário no banco de dados
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [adminUsername, hashedPassword, adminRole]
    );
    
    console.log('Usuário administrador criado com sucesso!');
    console.log('Username: admin');
    console.log('Senha: admin123');
    console.log('Role: admin');
    console.log('IMPORTANTE: Altere a senha após o primeiro login.');
    
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  } finally {
    // Fechar a conexão com o banco de dados
    await pool.end();
  }
}

// Executar a função
createAdmin();