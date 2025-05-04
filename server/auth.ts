import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";

// Estender o tipo global para incluir User no objeto do Express
declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

// Função para criar hash da senha
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Função para comparar senhas
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configuração do armazenamento de sessão PostgreSQL
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    pool,
    createTableIfMissing: true
  });

  // Configuração da sessão
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "las_tortillas_secret_key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configuração da estratégia de autenticação local
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Serialização do usuário (para armazenar na sessão)
  passport.serializeUser((user, done) => done(null, user.id));
  
  // Desserialização do usuário (para recuperar da sessão)
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Rota de registro
  app.post("/api/register", async (req, res, next) => {
    try {
      // Verificar se o usuário já existe
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Nome de usuário já está em uso"
        });
      }

      // Criar novo usuário com senha hash
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Login automático após o registro
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Retornar usuário sem a senha
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({
          status: "success",
          data: userWithoutPassword
        });
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao criar usuário"
      });
    }
  });

  // Rota de login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: UserType | false, info: any) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Nome de usuário ou senha incorretos"
        });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Retornar usuário sem a senha
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json({
          status: "success",
          data: userWithoutPassword
        });
      });
    })(req, res, next);
  });

  // Rota de logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({
        status: "success",
        message: "Logout realizado com sucesso"
      });
    });
  });

  // Rota para obter usuário atual
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        status: "error",
        message: "Não autenticado"
      });
    }
    
    // Retornar usuário sem a senha
    const { password, ...userWithoutPassword } = req.user as UserType;
    res.json({
      status: "success",
      data: userWithoutPassword
    });
  });
}