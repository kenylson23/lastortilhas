#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building for Vercel deployment...');

// Limpar builds anteriores
if (fs.existsSync('client/dist')) {
  fs.rmSync('client/dist', { recursive: true });
}
fs.mkdirSync('client/dist', { recursive: true });

// Build frontend básico que funciona
const indexHtml = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Las Tortillas - Restaurante Mexicano</title>
  <link href="https://cdn.tailwindcss.com/3.3.0/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-amber-50">
  <div id="root">
    <header class="bg-red-600 text-white p-4">
      <h1 class="text-3xl font-bold text-center">Las Tortillas</h1>
      <p class="text-center">Restaurante Mexicano Autêntico</p>
    </header>
    
    <main class="container mx-auto p-6">
      <section class="text-center mb-8">
        <h2 class="text-2xl font-semibold mb-4">Bem-vindos ao Las Tortillas</h2>
        <p class="text-gray-600">Sabores autênticos do México em Angola</p>
      </section>
      
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-2">Tacos al Pastor</h3>
          <p class="text-gray-600 mb-2">Tacos tradicionais com carne de porco marinada</p>
          <p class="text-red-600 font-bold">12,50 €</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-2">Quesadillas</h3>
          <p class="text-gray-600 mb-2">Tortilhas crocantes com queijo derretido</p>
          <p class="text-red-600 font-bold">8,90 €</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold mb-2">Horchata</h3>
          <p class="text-gray-600 mb-2">Bebida tradicional mexicana</p>
          <p class="text-red-600 font-bold">4,50 €</p>
        </div>
      </div>
      
      <div class="mt-8 text-center">
        <h3 class="text-xl font-semibold mb-4">Faça sua Reserva</h3>
        <p class="text-gray-600">Entre em contato para reservar sua mesa</p>
        <div class="mt-4">
          <span class="bg-red-600 text-white px-6 py-2 rounded">Site em Manutenção</span>
        </div>
      </div>
    </main>
    
    <footer class="bg-gray-800 text-white text-center p-4 mt-8">
      <p>&copy; 2025 Las Tortillas - Restaurante Mexicano</p>
    </footer>
  </div>
</body>
</html>`;

fs.writeFileSync('client/dist/index.html', indexHtml);

// Build backend
console.log('Building backend...');
execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:@neondatabase/serverless --external:ws --minify', {
  stdio: 'inherit'
});

console.log('Build completed successfully!');