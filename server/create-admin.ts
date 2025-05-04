import { db } from './db';
import { users } from '@shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Script para criar um usuário administrador
 */
async function createAdmin() {
  try {
    // Credenciais do administrador
    const username = 'admin';
    const password = 'admin123';
    
    // Verificar se já existe
    const [existingUser] = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUser) {
      console.log(`Usuário "${username}" já existe. Atualizando para administrador...`);
      
      // Atualizar para administrador com a senha fornecida
      await db.update(users)
        .set({
          role: 'admin',
          password: await hashPassword(password)
        })
        .where(eq(users.id, existingUser.id));
      
      console.log(`Usuário "${username}" foi atualizado com sucesso!`);
      console.log(`Credenciais: ${username} / ${password}`);
    } else {
      // Criar novo usuário administrador
      const hashedPassword = await hashPassword(password);
      
      const [newUser] = await db.insert(users)
        .values({
          username,
          password: hashedPassword,
          role: 'admin'
        })
        .returning();
      
      console.log(`Usuário administrador "${username}" foi criado com sucesso!`);
      console.log(`Credenciais: ${username} / ${password}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a criação do administrador:', error);
    process.exit(1);
  }
}

createAdmin();