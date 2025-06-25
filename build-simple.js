import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

async function buildForVercel() {
  try {
    console.log('🏗️ Building for Vercel...');
    
    // Build frontend with timeout protection
    console.log('📦 Building frontend...');
    process.chdir('client');
    
    // Use timeout to prevent hanging
    execSync('timeout 300 npm run build', { 
      stdio: 'inherit',
      timeout: 300000 // 5 minutes max
    });
    
    process.chdir('..');
    
    // Copy build to root dist folder
    if (fs.existsSync('client/dist')) {
      fs.copySync('client/dist', 'dist');
      console.log('✅ Frontend built successfully');
    } else {
      throw new Error('Frontend build failed');
    }
    
    console.log('🚀 Build complete for Vercel');
    
  } catch (error) {
    console.error('❌ Build error:', error.message);
    process.exit(1);
  }
}

buildForVercel();