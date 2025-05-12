import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { 
  insertReservationSchema, 
  insertMenuCategorySchema, 
  insertMenuItemSchema,
  insertGalleryItemSchema,
  type InsertReservation
} from "@shared/schema";
import { setupAuth } from "./auth";
import { isAuthenticated, isAdmin } from "./middleware";
import multer from "multer";
import fs from "fs-extra";
import path from "path";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar diretório de uploads
  const uploadDir = path.resolve("public/uploads");
  fs.ensureDirSync(uploadDir);
  
  // Configurar o armazenamento do multer
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Criar nome de arquivo único com UUID para evitar colisões
      const uniqueId = randomUUID();
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueId}${ext}`);
    }
  });
  
  // Configuração de limite de tamanho e tipos
  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      // Aceitar apenas imagens e vídeos
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de arquivo não suportado: ${file.mimetype}`));
      }
    }
  });
  
  // Configurar autenticação
  setupAuth(app);

  // Rota para upload de arquivos
  app.post("/api/upload", isAuthenticated, isAdmin, upload.single("file"), (req, res) => {
    try {
      // Verificar se um arquivo foi enviado
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "Nenhum arquivo enviado"
        });
      }
      
      // Verificar o tipo de arquivo
      const isImage = req.file.mimetype.startsWith('image/');
      const isVideo = req.file.mimetype.startsWith('video/');
      
      if (!isImage && !isVideo) {
        // Remover o arquivo enviado
        fs.unlinkSync(req.file.path);
        
        return res.status(400).json({
          status: "error",
          message: "Tipo de arquivo não suportado"
        });
      }
      
      // Construir a URL pública do arquivo
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const relativePath = req.file.path.replace(/^public/, '');
      const fileUrl = `${baseUrl}${relativePath}`;
      
      // Retornar a URL do arquivo
      res.json({
        status: "success",
        data: {
          url: fileUrl,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (error: any) {
      console.error("Erro no upload:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao processar o upload do arquivo"
      });
    }
  });

  // ===== ROTAS PÚBLICAS =====
  
  // Reserva
  app.post("/api/reservations", async (req, res) => {
    try {
      const validatedData = insertReservationSchema.parse(req.body);
      
      // Se o usuário estiver autenticado, associar a reserva a ele
      if (req.isAuthenticated()) {
        validatedData.user_id = req.user!.id;
      }
      
      const reservation = await dbStorage.createReservation(validatedData);
      
      res.status(201).json({
        status: "success",
        data: {
          reservation
        }
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao criar reserva"
      });
    }
  });
  
  // Menu público
  app.get("/api/menu/categories", async (req, res) => {
    try {
      const categories = await dbStorage.getMenuCategories();
      res.json({
        status: "success",
        data: categories
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao buscar categorias do menu"
      });
    }
  });
  
  app.get("/api/menu/items", async (req, res) => {
    try {
      const items = await dbStorage.getMenuItems();
      res.json({
        status: "success",
        data: items
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao buscar itens do menu"
      });
    }
  });
  
  app.get("/api/menu/categories/:id/items", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({
          status: "error",
          message: "ID de categoria inválido"
        });
      }
      
      const items = await dbStorage.getMenuItemsByCategory(categoryId);
      res.json({
        status: "success",
        data: items
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao buscar itens do menu por categoria"
      });
    }
  });
  
  app.get("/api/menu/featured", async (req, res) => {
    try {
      const items = await dbStorage.getFeaturedMenuItems();
      res.json({
        status: "success",
        data: items
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao buscar itens em destaque"
      });
    }
  });
  
  // Galeria pública
  app.get("/api/gallery", async (req, res) => {
    try {
      const items = await dbStorage.getActiveGalleryItems();
      res.json({
        status: "success",
        data: items
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao buscar itens da galeria"
      });
    }
  });
  
  // ===== ROTAS ADMINISTRATIVAS =====
  
  // Aplicamos os middleware de autenticação e autorização para todas as rotas administrativas
  app.use("/api/admin", isAuthenticated);
  app.use("/api/admin", isAdmin);
  
  // Gerenciamento de categorias
  app.get("/api/admin/menu/categories", async (req, res) => {
    try {
      const categories = await dbStorage.getMenuCategories();
      res.json({
        status: "success",
        data: categories
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao buscar categorias"
      });
    }
  });
  
  app.post("/api/admin/menu/categories", async (req, res) => {
    try {
      const validatedData = insertMenuCategorySchema.parse(req.body);
      
      // Verificar se já existe uma categoria com o mesmo nome
      const allCategories = await dbStorage.getMenuCategories();
      const nameExists = allCategories.some(cat => cat.name === validatedData.name);
      
      if (nameExists) {
        return res.status(400).json({
          status: "error",
          message: "duplicate key value violates unique constraint \"menu_categories_name_unique\""
        });
      }
      
      const category = await dbStorage.createMenuCategory(validatedData);
      
      res.status(201).json({
        status: "success",
        data: category
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao criar categoria"
      });
    }
  });
  
  app.put("/api/admin/menu/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID de categoria inválido"
        });
      }
      
      const existingCategory = await dbStorage.getMenuCategory(id);
      if (!existingCategory) {
        return res.status(404).json({
          status: "error",
          message: "Categoria não encontrada"
        });
      }
      
      // Verificar se o nome está sendo alterado e se já existe outro com o mesmo nome
      if (req.body.name && req.body.name !== existingCategory.name) {
        // Buscar todas as categorias para verificar se o nome já existe
        const allCategories = await dbStorage.getMenuCategories();
        const nameExists = allCategories.some(cat => 
          cat.id !== id && cat.name === req.body.name
        );
        
        if (nameExists) {
          return res.status(400).json({
            status: "error",
            message: "duplicate key value violates unique constraint \"menu_categories_name_unique\""
          });
        }
      }
      
      // Validar dados parciais
      const updateData = req.body;
      const updatedCategory = await dbStorage.updateMenuCategory(id, updateData);
      
      res.json({
        status: "success",
        data: updatedCategory
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao atualizar categoria"
      });
    }
  });
  
  app.delete("/api/admin/menu/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID de categoria inválido"
        });
      }
      
      const existingCategory = await dbStorage.getMenuCategory(id);
      if (!existingCategory) {
        return res.status(404).json({
          status: "error",
          message: "Categoria não encontrada"
        });
      }
      
      const success = await dbStorage.deleteMenuCategory(id);
      if (!success) {
        return res.status(500).json({
          status: "error",
          message: "Falha ao excluir categoria"
        });
      }
      
      res.json({
        status: "success",
        message: "Categoria excluída com sucesso"
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao excluir categoria"
      });
    }
  });
  
  // Gerenciamento de itens de menu
  app.get("/api/admin/menu/items", async (req, res) => {
    try {
      const items = await dbStorage.getMenuItems();
      res.json({
        status: "success",
        data: items
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao buscar itens do menu"
      });
    }
  });
  
  app.post("/api/admin/menu/items", async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const item = await dbStorage.createMenuItem(validatedData);
      
      res.status(201).json({
        status: "success",
        data: item
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao criar item do menu"
      });
    }
  });
  
  app.put("/api/admin/menu/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID de item inválido"
        });
      }
      
      const existingItem = await dbStorage.getMenuItem(id);
      if (!existingItem) {
        return res.status(404).json({
          status: "error",
          message: "Item não encontrado"
        });
      }
      
      // Validar dados parciais
      const updateData = req.body;
      const updatedItem = await dbStorage.updateMenuItem(id, updateData);
      
      res.json({
        status: "success",
        data: updatedItem
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao atualizar item do menu"
      });
    }
  });
  
  app.delete("/api/admin/menu/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID de item inválido"
        });
      }
      
      const existingItem = await dbStorage.getMenuItem(id);
      if (!existingItem) {
        return res.status(404).json({
          status: "error",
          message: "Item não encontrado"
        });
      }
      
      const success = await dbStorage.deleteMenuItem(id);
      if (!success) {
        return res.status(500).json({
          status: "error",
          message: "Falha ao excluir item"
        });
      }
      
      res.json({
        status: "success",
        message: "Item excluído com sucesso"
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao excluir item"
      });
    }
  });
  
  // Gerenciamento de reservas
  app.get("/api/admin/reservations", async (req, res) => {
    try {
      const reservations = await dbStorage.getReservations();
      res.json({
        status: "success",
        data: reservations
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao buscar reservas"
      });
    }
  });
  
  app.put("/api/admin/reservations/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID de reserva inválido"
        });
      }
      
      const { status } = req.body;
      if (!status || !["pendente", "confirmada", "cancelada"].includes(status)) {
        return res.status(400).json({
          status: "error",
          message: "Status inválido. Deve ser 'pendente', 'confirmada' ou 'cancelada'"
        });
      }
      
      const existingReservation = await dbStorage.getReservation(id);
      if (!existingReservation) {
        return res.status(404).json({
          status: "error",
          message: "Reserva não encontrada"
        });
      }
      
      const updatedReservation = await dbStorage.updateReservationStatus(id, status);
      
      res.json({
        status: "success",
        data: updatedReservation
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao atualizar status da reserva"
      });
    }
  });
  
  // Rota para atualizar detalhes da reserva
  app.put("/api/admin/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID de reserva inválido"
        });
      }
      
      const existingReservation = await dbStorage.getReservation(id);
      if (!existingReservation) {
        return res.status(404).json({
          status: "error",
          message: "Reserva não encontrada"
        });
      }
      
      // Extrair apenas os campos que podem ser atualizados
      const { name, phone, date, time, guests, message } = req.body;
      const updateData: Partial<InsertReservation> = {};
      
      // Adicionar apenas os campos que estão presentes no request
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (date !== undefined) updateData.date = date;
      if (time !== undefined) updateData.time = time;
      if (guests !== undefined) updateData.guests = guests;
      if (message !== undefined) updateData.message = message;
      
      const updatedReservation = await dbStorage.updateReservation(id, updateData);
      
      res.json({
        status: "success",
        data: updatedReservation
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao atualizar detalhes da reserva"
      });
    }
  });
  
  // Gerenciamento de galeria
  app.get("/api/admin/gallery", async (req, res) => {
    try {
      const items = await dbStorage.getGalleryItems();
      res.json({
        status: "success",
        data: items
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao buscar itens da galeria"
      });
    }
  });
  
  app.post("/api/admin/gallery", async (req, res) => {
    try {
      const validatedData = insertGalleryItemSchema.parse(req.body);
      const item = await dbStorage.createGalleryItem(validatedData);
      
      res.status(201).json({
        status: "success",
        data: item
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao criar item da galeria"
      });
    }
  });
  
  app.put("/api/admin/gallery/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID de item inválido"
        });
      }
      
      const existingItem = await dbStorage.getGalleryItem(id);
      if (!existingItem) {
        return res.status(404).json({
          status: "error",
          message: "Item não encontrado"
        });
      }
      
      // Validar dados parciais
      const updateData = req.body;
      const updatedItem = await dbStorage.updateGalleryItem(id, updateData);
      
      res.json({
        status: "success",
        data: updatedItem
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: error.message || "Falha ao atualizar item da galeria"
      });
    }
  });
  
  app.delete("/api/admin/gallery/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID de item inválido"
        });
      }
      
      const existingItem = await dbStorage.getGalleryItem(id);
      if (!existingItem) {
        return res.status(404).json({
          status: "error",
          message: "Item não encontrado"
        });
      }
      
      const success = await dbStorage.deleteGalleryItem(id);
      if (!success) {
        return res.status(500).json({
          status: "error",
          message: "Falha ao excluir item"
        });
      }
      
      res.json({
        status: "success",
        message: "Item excluído com sucesso"
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Falha ao excluir item"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
