import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReservationSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar autenticação
  setupAuth(app);

  // Restaurant reservation API route
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
        message: error.message || "Failed to create reservation"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
