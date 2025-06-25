import { execSync } from 'child_process';
import fs from 'fs-extra';

console.log('Building Las Tortillas for Vercel...');

try {
  // Verificar estrutura
  if (!fs.existsSync('client/package.json')) {
    throw new Error('Client directory not found');
  }
  
  // Build frontend
  console.log('Building frontend...');
  execSync('cd client && npm run build', { 
    stdio: 'inherit',
    timeout: 600000, // 10 minutos
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  // Verificar resultado
  if (fs.existsSync('client/dist/index.html')) {
    console.log('Frontend built successfully');
    
    const distFiles = fs.readdirSync('client/dist');
    console.log(`Generated ${distFiles.length} files in client/dist`);
  } else {
    throw new Error('Build verification failed - no index.html found');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}