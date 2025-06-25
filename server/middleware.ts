import { Request, Response, NextFunction } from "express";

// Middleware para verificar se o usuário está autenticado
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({
    status: "error",
    message: "Não autenticado"
  });
}

// Middleware para verificar se o usuário é um administrador
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  
  res.status(401).json({
    status: "error",
    message: "Não autenticado"
  });
}