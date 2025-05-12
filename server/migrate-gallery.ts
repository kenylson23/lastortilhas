import { db } from './db';
import { galleryItems } from '@shared/schema';

async function migrateGallery() {
  console.log('Migrando tabela da galeria...');

  try {
    // Criar tabela da galeria se não existir
    await db.execute(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        src TEXT NOT NULL,
        thumbnail TEXT,
        type TEXT NOT NULL DEFAULT 'image',
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Verificar se a tabela foi criada
    const tableCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'gallery_items'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('Tabela da galeria criada/migrada com sucesso!');
    } else {
      console.error('Erro: Tabela da galeria não foi criada corretamente.');
    }

  } catch (error) {
    console.error('Erro durante a migração da galeria:', error);
  } finally {
    process.exit(0);
  }
}

migrateGallery();