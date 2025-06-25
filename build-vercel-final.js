import { execSync } from 'child_process';
import fs from 'fs-extra';

console.log('Building optimized version for Vercel...');

try {
  // Verificar estrutura
  if (!fs.existsSync('client/package.json')) {
    throw new Error('Client directory not found');
  }
  
  // Build com configurações otimizadas
  const buildCmd = 'cd client && npm run build';
  
  execSync(buildCmd, { 
    stdio: 'inherit',
    timeout: 900000, // 15 minutos
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=8192',
      VITE_NODE_ENV: 'production'
    }
  });
  
  // Verificar resultado
  if (fs.existsSync('client/dist/index.html')) {
    console.log('Build completed successfully');
    
    // Estatísticas do build
    const distFiles = fs.readdirSync('client/dist');
    console.log(`Generated ${distFiles.length} files`);
  } else {
    throw new Error('Build verification failed');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}