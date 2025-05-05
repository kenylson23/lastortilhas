import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertReservationSchema, 
  insertMenuCategorySchema, 
  insertMenuItemSchema
} from "@shared/schema";
import { setupAuth } from "./auth";
import { isAuthenticated, isAdmin } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar autenticação
  setupAuth(app);

  // ===== ROTAS PÚBLICAS =====
  
  // Reserva
  app.post("/api/reservations", async (req, res) => {
    try {
      const validatedData = insertReservationSchema.parse(req.body);
      const reservation = await storage.createReservation(validatedData);
      
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
      const categories = await storage.getMenuCategories();
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
      const items = await storage.getMenuItems();
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
      
      const items = await storage.getMenuItemsByCategory(categoryId);
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
      const items = await storage.getFeaturedMenuItems();
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
  
  // ===== ROTAS ADMINISTRATIVAS =====
  
  // Aplicamos os middleware de autenticação e autorização para todas as rotas administrativas
  app.use("/api/admin", isAuthenticated);
  app.use("/api/admin", isAdmin);
  
  // Gerenciamento de categorias
  app.get("/api/admin/menu/categories", async (req, res) => {
    try {
      const categories = await storage.getMenuCategories();
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
      const category = await storage.createMenuCategory(validatedData);
      
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
      
      const existingCategory = await storage.getMenuCategory(id);
      if (!existingCategory) {
        return res.status(404).json({
          status: "error",
          message: "Categoria não encontrada"
        });
      }
      
      // Validar dados parciais
      const updateData = req.body;
      const updatedCategory = await storage.updateMenuCategory(id, updateData);
      
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
      
      const existingCategory = await storage.getMenuCategory(id);
      if (!existingCategory) {
        return res.status(404).json({
          status: "error",
          message: "Categoria não encontrada"
        });
      }
      
      const success = await storage.deleteMenuCategory(id);
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
      const items = await storage.getMenuItems();
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
      const item = await storage.createMenuItem(validatedData);
      
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
      
      const existingItem = await storage.getMenuItem(id);
      if (!existingItem) {
        return res.status(404).json({
          status: "error",
          message: "Item não encontrado"
        });
      }
      
      // Validar dados parciais
      const updateData = req.body;
      const updatedItem = await storage.updateMenuItem(id, updateData);
      
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
      
      const existingItem = await storage.getMenuItem(id);
      if (!existingItem) {
        return res.status(404).json({
          status: "error",
          message: "Item não encontrado"
        });
      }
      
      const success = await storage.deleteMenuItem(id);
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
      const reservations = await storage.getReservations();
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
      
      const existingReservation = await storage.getReservation(id);
      if (!existingReservation) {
        return res.status(404).json({
          status: "error",
          message: "Reserva não encontrada"
        });
      }
      
      const updatedReservation = await storage.updateReservationStatus(id, status);
      
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

  const httpServer = createServer(app);

  return httpServer;
}
