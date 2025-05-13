/**
 * Script para migrar a tabela de galeria, removendo colunas não utilizadas
 */
import { db } from "./db";
import { galleryItems } from "@shared/schema";
import { sql } from "drizzle-orm";

async function migrateGalleryTable() {
  console.log("Iniciando migração da tabela de galeria");
  
  try {
    // Verificar se as colunas existem antes de tentar removê-las
    const checkColumnsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'gallery_items' 
      AND (column_name = 'type' OR column_name = 'thumbnail')
    `);
    
    const columns = checkColumnsResult.rows.map((row: any) => row.column_name);
    console.log("Colunas encontradas para remoção:", columns);
    
    if (columns.includes('type')) {
      console.log("Removendo coluna 'type'...");
      await db.execute(sql`ALTER TABLE gallery_items DROP COLUMN IF EXISTS type`);
      console.log("Coluna 'type' removida com sucesso");
    }
    
    if (columns.includes('thumbnail')) {
      console.log("Removendo coluna 'thumbnail'...");
      await db.execute(sql`ALTER TABLE gallery_items DROP COLUMN IF EXISTS thumbnail`);
      console.log("Coluna 'thumbnail' removida com sucesso");
    }
    
    console.log("Migração concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a migração:", error);
    throw error;
  }
}

// Auto-execução da função principal
migrateGalleryTable()
  .then(() => {
    console.log("Script de migração concluído");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Falha no script de migração:", error);
    process.exit(1);
  });