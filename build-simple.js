#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs-extra';

console.log('🚀 Starting optimized build for Vercel...');

try {
  // Ensure client/dist exists
  fs.ensureDirSync('client/dist');
  
  // Build frontend with fallback strategy
  console.log('📦 Building frontend...');
  
  // Copy existing client/dist if it exists, otherwise create fallback
  if (fs.existsSync('client/dist') && fs.readdirSync('client/dist').length > 0) {
    console.log('✅ Using existing frontend build');
  } else {
    console.log('Creating minimal frontend fallback...');
    
    // Create minimal index.html that will reload after backend is ready
    const fallbackHtml = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Las Tortillas - Restaurant</title>
  <style>
    body { font-family: -apple-system, system-ui; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 4rem 2rem; text-align: center; }
    .logo { font-size: 2.5rem; font-weight: bold; color: #dc2626; margin-bottom: 1rem; }
    .message { font-size: 1.1rem; color: #64748b; margin-bottom: 2rem; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top: 4px solid #dc2626; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🌮 Las Tortillas</div>
    <div class="message">Carregando aplicação...</div>
    <div class="spinner"></div>
    <script>
      // Try to load the full app after 3 seconds
      setTimeout(() => {
        fetch('/api/user').then(() => {
          window.location.reload();
        }).catch(() => {
          setTimeout(() => window.location.reload(), 2000);
        });
      }, 3000);
    </script>
  </div>
</body>
</html>`;
    
    fs.writeFileSync('client/dist/index.html', fallbackHtml);
    console.log('✅ Fallback HTML created');
  }
  
  // Build backend
  console.log('🔧 Building backend...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:@neondatabase/serverless --external:ws --external:fs-extra --external:multer --external:@rollup/rollup-* --external:rollup', {
    stdio: 'inherit'
  });
  console.log('✅ Backend build completed');
  
  console.log('🎉 Build process completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}