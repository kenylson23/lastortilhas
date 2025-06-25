import { execSync } from 'child_process';
import fs from 'fs-extra';

console.log('Building for Vercel...');

try {
  // Build direto no client com timeout
  console.log('Building frontend with optimizations...');
  
  const buildCommand = 'cd client && npm run build';
  execSync(buildCommand, { 
    stdio: 'inherit',
    timeout: 600000, // 10 minutos max
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  // Verificar se o build foi criado
  if (!fs.existsSync('client/dist')) {
    throw new Error('Build failed: client/dist directory not created');
  }
  
  console.log('Frontend built successfully');
  
} catch (error) {
  console.error('Build error:', error.message);
  
  // Fallback: build básico sem otimizações
  console.log('Trying fallback build...');
  try {
    execSync('cd client && npm run build -- --mode production', { 
      stdio: 'inherit',
      timeout: 300000 // 5 minutos
    });
    console.log('Fallback build successful');
  } catch (fallbackError) {
    console.error('Fallback build failed:', fallbackError.message);
    process.exit(1);
  }
}