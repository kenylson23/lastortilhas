import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildForVercel() {
  try {
    console.log('📦 Iniciando build para Vercel...');
    
    // Build do frontend usando comando direto
    console.log('🏗️ Construindo frontend...');
    
    process.chdir('client');
    execSync('npm run build', { stdio: 'inherit' });
    process.chdir('..');
    
    // Verificar se o build foi criado
    const distPath = path.join(__dirname, 'client', 'dist');
    if (!fs.existsSync(distPath)) {
      throw new Error('Build do frontend falhou - pasta dist não encontrada');
    }
    
    console.log('✅ Frontend construído com sucesso!');
    console.log('📁 Arquivos gerados em client/dist/');
    
    // Listar arquivos principais gerados
    const files = fs.readdirSync(distPath);
    console.log('📄 Arquivos principais:', files.filter(f => !f.startsWith('.')).slice(0, 5).join(', '));
    
    console.log('🚀 Build pronto para deploy no Vercel!');
    
  } catch (error) {
    console.error('❌ Erro no build:', error.message);
    process.exit(1);
  }
}

buildForVercel();