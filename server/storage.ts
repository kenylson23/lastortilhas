import { users, reservations, type User, type InsertUser, type InsertReservation, type Reservation } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    // Ensure message is null instead of undefined if not provided
    const message = insertReservation.message ?? null;
    const values = { 
      ...insertReservation, 
      message
    };
    const result = await db.insert(reservations).values(values).returning();
    return result[0];
  }
}

// Use a classe DatabaseStorage em vez de MemStorage
export const storage = new DatabaseStorage();
