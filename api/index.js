import express from 'express';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import bcrypt from 'bcrypt';
import connectPg from 'connect-pg-simple';
import * as schema from '../shared/schema.js';
import { eq, desc, asc } from 'drizzle-orm';
import { z } from 'zod';
import { insertReservationSchema, insertUserSchema } from '../shared/schema.js';

const app = express();

// Configuração do banco de dados para Supabase
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
const db = drizzle(pool, { schema });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de CORS para Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configuração de sessão para Vercel (usando MemoryStore para serverless)
app.use(session({
  secret: process.env.SESSION_SECRET || 'las_tortillas_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Configuração do Passport
app.use(passport.initialize());
app.use(passport.session());

// Estratégia local do Passport
passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async (username, password, done) => {
    try {
      const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
      const user = users[0];
      
      if (!user) {
        return done(null, false, { message: 'Usuário não encontrado' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Senha incorreta' });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    const user = users[0];
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});

// Middleware de autenticação
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ status: "error", message: "Não autenticado" });
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  res.status(403).json({ status: "error", message: "Acesso negado - Admin necessário" });
}

// Rotas de autenticação
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Erro interno do servidor" });
    }
    if (!user) {
      return res.status(401).json({ status: "error", message: info?.message || "Credenciais inválidas" });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ status: "error", message: "Erro ao fazer login" });
      }
      return res.json({ status: "success", data: user });
    });
  })(req, res, next);
});

app.post('/api/register', async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    // Verificar se usuário já existe
    const existingUsers = await db.select().from(schema.users).where(eq(schema.users.username, validatedData.username));
    if (existingUsers.length > 0) {
      return res.status(400).json({ status: "error", message: "Usuário já existe" });
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Criar usuário
    const newUsers = await db.insert(schema.users).values({
      ...validatedData,
      password: hashedPassword
    }).returning();
    
    const newUser = newUsers[0];
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Login automático
    req.logIn(userWithoutPassword, (err) => {
      if (err) {
        return res.status(500).json({ status: "error", message: "Usuário criado, mas erro no login automático" });
      }
      res.status(201).json({ status: "success", data: userWithoutPassword });
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: "error", message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ status: "error", message: "Erro interno do servidor" });
  }
});

app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Erro ao fazer logout" });
    }
    res.json({ status: "success", message: "Logout realizado com sucesso" });
  });
});

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ status: "success", data: req.user });
  } else {
    res.status(401).json({ status: "error", message: "Não autenticado" });
  }
});

// Rotas do menu
app.get('/api/menu/categories', async (req, res) => {
  try {
    const categories = await db.select().from(schema.menuCategories).orderBy(asc(schema.menuCategories.order));
    res.json({ status: "success", data: categories });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Erro ao buscar categorias" });
  }
});

app.get('/api/menu/items', async (req, res) => {
  try {
    const items = await db.select().from(schema.menuItems).orderBy(asc(schema.menuItems.category_id), asc(schema.menuItems.order));
    res.json({ status: "success", data: items });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Erro ao buscar itens do menu" });
  }
});

// Rotas da galeria
app.get('/api/gallery', async (req, res) => {
  try {
    const items = await db.select().from(schema.galleryItems)
      .where(eq(schema.galleryItems.active, true))
      .orderBy(asc(schema.galleryItems.order));
    res.json({ status: "success", data: items });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Erro ao buscar galeria" });
  }
});

// Rotas de reservas
app.post('/api/reservations', async (req, res) => {
  try {
    const validatedData = insertReservationSchema.parse(req.body);
    
    // Se usuário está logado, associar à reserva
    if (req.isAuthenticated()) {
      validatedData.user_id = req.user.id;
    }
    
    const newReservations = await db.insert(schema.reservations).values(validatedData).returning();
    const reservation = newReservations[0];
    
    res.status(201).json({ 
      status: "success", 
      data: { reservation },
      message: "Reserva criada com sucesso!" 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: "error", message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ status: "error", message: "Erro ao criar reserva" });
  }
});

app.get('/api/reservations', isAuthenticated, async (req, res) => {
  try {
    const reservations = await db.select().from(schema.reservations)
      .where(eq(schema.reservations.user_id, req.user.id))
      .orderBy(desc(schema.reservations.created_at));
    res.json({ status: "success", data: reservations });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Erro ao buscar reservas" });
  }
});

// Rotas admin
app.get('/api/admin/reservations', isAdmin, async (req, res) => {
  try {
    const reservations = await db.select().from(schema.reservations).orderBy(desc(schema.reservations.created_at));
    res.json({ status: "success", data: reservations });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Erro ao buscar reservas" });
  }
});

app.put('/api/admin/reservations/:id/status', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!["pendente", "confirmada", "cancelada"].includes(status)) {
      return res.status(400).json({ status: "error", message: "Status inválido" });
    }
    
    const updatedReservations = await db.update(schema.reservations)
      .set({ status })
      .where(eq(schema.reservations.id, id))
      .returning();
    
    if (updatedReservations.length === 0) {
      return res.status(404).json({ status: "error", message: "Reserva não encontrada" });
    }
    
    res.json({ status: "success", data: updatedReservations[0] });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Erro ao atualizar reserva" });
  }
});

// Rota raiz para health check
app.get('/api', (req, res) => {
  res.json({ status: "success", message: "Las Tortillas API está funcionando!" });
});

// Handler para Vercel
export default app;