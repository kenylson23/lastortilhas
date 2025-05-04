import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script para promover um usuário a administrador
 * ou criar um novo usuário admin se ele não existir
 */
async function setupAdmin() {
  try {
    // Verificar se o usuário existe
    const username = process.argv[2] || 'admin';
    
    const [existingUser] = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUser) {
      // Atualizar o usuário existente para administrador
      await db.update(users)
        .set({ role: 'admin' })
        .where(eq(users.id, existingUser.id));
      
      console.log(`Usuário "${username}" foi promovido a administrador com sucesso!`);
    } else {
      console.log(`Usuário "${username}" não encontrado. Por favor, crie o usuário primeiro.`);
      console.log('Você pode criar um usuário registrando-se no site e depois executar este script novamente.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a configuração de admin:', error);
    process.exit(1);
  }
}

setupAdmin();