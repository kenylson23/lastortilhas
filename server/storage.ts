import { users, type User, type InsertUser, type InsertReservation, type Reservation } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reservations: Map<number, Reservation>;
  currentId: number;
  reservationId: number;

  constructor() {
    this.users = new Map();
    this.reservations = new Map();
    this.currentId = 1;
    this.reservationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = this.reservationId++;
    const created_at = new Date().toISOString();
    // Ensure message is null instead of undefined if not provided
    const message = insertReservation.message ?? null;
    const reservation: Reservation = { 
      ...insertReservation, 
      id, 
      created_at,
      message
    };
    this.reservations.set(id, reservation);
    return reservation;
  }
}

export const storage = new MemStorage();
