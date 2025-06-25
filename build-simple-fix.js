import { execSync } from 'child_process';
import fs from 'fs-extra';

console.log('Building for Vercel...');

// Usar o script otimizado
try {
  execSync('node build-vercel-final.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}