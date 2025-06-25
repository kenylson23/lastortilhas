// Vercel serverless function entry point
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app;

export default async function handler(req, res) {
  if (!app) {
    try {
      // Importar módulos necessários
      const { registerRoutes } = await import('../dist/index.js');
      
      app = express();
      app.set('trust proxy', 1);
      app.use(express.json({ limit: '10mb' }));
      app.use(express.urlencoded({ extended: true, limit: '10mb' }));
      
      // Configurar variável de ambiente para modo serverless
      process.env.VERCEL = '1';
      process.env.NODE_ENV = 'production';
      
      // Servir arquivos estáticos
      app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
      
      // Configurar rotas
      await registerRoutes(app);
      
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  
  return app(req, res);
}