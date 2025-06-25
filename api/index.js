// Vercel serverless function entry point
import express from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Setup routes
await registerRoutes(app);

export default app;