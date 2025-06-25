// Vercel serverless function
import express from 'express';

let app;

export default async function handler(req, res) {
  if (!app) {
    try {
      // Configurar ambiente serverless antes dos imports
      process.env.VERCEL = '1';
      process.env.NODE_ENV = 'production';
      
      // Importar routes do backend construído
      const { registerRoutes } = await import('../dist/index.js');
      
      // Inicializar Express
      app = express();
      app.set('trust proxy', 1);
      app.use(express.json({ limit: '10mb' }));
      app.use(express.urlencoded({ extended: true, limit: '10mb' }));
      
      // Middleware para logs
      app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
      
      // Registrar todas as rotas
      await registerRoutes(app);
      
      console.log('Vercel function initialized successfully');
      
    } catch (error) {
      console.error('Erro na inicialização:', error);
      console.error('Stack:', error.stack);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  
  return app(req, res);
}