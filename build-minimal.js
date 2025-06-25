#!/usr/bin/env node
// Build mínimo para Vercel - evita travamentos
import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log('🚀 Build mínimo para Vercel...');
  
  // Frontend build simples
  if (!fs.existsSync('client/dist')) {
    fs.mkdirSync('client/dist', { recursive: true });
  }
  
  // Usar build existente se disponível, senão criar mínimo
  if (fs.existsSync('client/dist/index.html')) {
    console.log('✅ Frontend build já existe');
  } else {
  
  // HTML mínimo  
  const minimalHtml = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Las Tortillas</title>
</head>
<body>
  <div id="root">Loading...</div>
</body>
</html>`;
  
    fs.writeFileSync('client/dist/index.html', minimalHtml);
    console.log('✅ Frontend mínimo criado');
  }
  
  // Backend build ultra simples
  console.log('🔧 Backend build...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:@neondatabase/serverless --external:ws --external:lightningcss --external:@babel/preset-typescript --log-level=error', {
    stdio: 'inherit',
    timeout: 30000
  });
  
  console.log('🎉 Build concluído!');
  
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}