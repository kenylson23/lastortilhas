// Vercel serverless function
import express from 'express';

let app;

export default async function handler(req, res) {
  if (!app) {
    try {
      // Importar routes do backend construído
      const routes = await import('../dist/index.js');
      const { registerRoutes } = routes;
      
      // Inicializar Express
      app = express();
      app.set('trust proxy', 1);
      app.use(express.json({ limit: '10mb' }));
      app.use(express.urlencoded({ extended: true, limit: '10mb' }));
      
      // Configurar ambiente serverless
      process.env.VERCEL = '1';
      process.env.NODE_ENV = 'production';
      
      // Registrar todas as rotas
      await registerRoutes(app);
      
    } catch (error) {
      console.error('Erro na inicialização:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
  
  return app(req, res);
}