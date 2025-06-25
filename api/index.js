// Vercel serverless function entry point
import express from 'express';

let app;

export default async function handler(req, res) {
  if (!app) {
    // Lazy load para evitar problemas de cold start
    const { registerRoutes } = await import('../dist/routes.js');
    
    app = express();
    app.set('trust proxy', 1);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Configurar variável de ambiente para modo serverless
    process.env.VERCEL = '1';
    
    await registerRoutes(app);
  }
  
  return app(req, res);
}