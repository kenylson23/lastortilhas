import { 
  users, reservations, menuCategories, menuItems, galleryItems,
  type User, type InsertUser, 
  type InsertReservation, type Reservation,
  type InsertMenuCategory, type MenuCategory,
  type InsertMenuItem, type MenuItem,
  type InsertGalleryItem, type GalleryItem
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc } from "drizzle-orm";

export interface IStorage {
  // Autenticação e usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Reservas
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  getReservations(): Promise<Reservation[]>;
  getReservation(id: number): Promise<Reservation | undefined>;
  updateReservationStatus(id: number, status: string): Promise<Reservation | undefined>;
  
  // Categorias de menu
  getMenuCategories(): Promise<MenuCategory[]>;
  getMenuCategory(id: number): Promise<MenuCategory | undefined>;
  createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  updateMenuCategory(id: number, category: Partial<InsertMenuCategory>): Promise<MenuCategory | undefined>;
  deleteMenuCategory(id: number): Promise<boolean>;
  
  // Itens de menu
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  getFeaturedMenuItems(): Promise<MenuItem[]>;
  
  // Galeria
  getGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItem(id: number): Promise<GalleryItem | undefined>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  updateGalleryItem(id: number, item: Partial<InsertGalleryItem>): Promise<GalleryItem | undefined>;
  deleteGalleryItem(id: number): Promise<boolean>;
  getActiveGalleryItems(): Promise<GalleryItem[]>;
}

export class DatabaseStorage implements IStorage {
  // === AUTENTICAÇÃO E USUÁRIOS ===
  
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
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  // === RESERVAS ===
  
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
  
  async getReservations(): Promise<Reservation[]> {
    return await db.select().from(reservations).orderBy(desc(reservations.created_at));
  }
  
  async getReservation(id: number): Promise<Reservation | undefined> {
    const result = await db.select().from(reservations).where(eq(reservations.id, id));
    return result[0];
  }
  
  async updateReservationStatus(id: number, status: string): Promise<Reservation | undefined> {
    const result = await db.update(reservations)
      .set({ status })
      .where(eq(reservations.id, id))
      .returning();
    return result[0];
  }
  
  // === CATEGORIAS DE MENU ===
  
  async getMenuCategories(): Promise<MenuCategory[]> {
    return await db.select().from(menuCategories).orderBy(asc(menuCategories.order));
  }
  
  async getMenuCategory(id: number): Promise<MenuCategory | undefined> {
    const result = await db.select().from(menuCategories).where(eq(menuCategories.id, id));
    return result[0];
  }
  
  async createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const result = await db.insert(menuCategories).values(category).returning();
    return result[0];
  }
  
  async updateMenuCategory(id: number, category: Partial<InsertMenuCategory>): Promise<MenuCategory | undefined> {
    const result = await db.update(menuCategories)
      .set(category)
      .where(eq(menuCategories.id, id))
      .returning();
    return result[0];
  }
  
  async deleteMenuCategory(id: number): Promise<boolean> {
    try {
      await db.delete(menuCategories).where(eq(menuCategories.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting menu category:", error);
      return false;
    }
  }
  
  // === ITENS DE MENU ===
  
  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems).orderBy(asc(menuItems.category_id), asc(menuItems.order));
  }
  
  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return await db.select()
      .from(menuItems)
      .where(eq(menuItems.category_id, categoryId))
      .orderBy(asc(menuItems.order));
  }
  
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const result = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return result[0];
  }
  
  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const result = await db.insert(menuItems).values(item).returning();
    return result[0];
  }
  
  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const result = await db.update(menuItems)
      .set(item)
      .where(eq(menuItems.id, id))
      .returning();
    return result[0];
  }
  
  async deleteMenuItem(id: number): Promise<boolean> {
    try {
      await db.delete(menuItems).where(eq(menuItems.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return false;
    }
  }
  
  async getFeaturedMenuItems(): Promise<MenuItem[]> {
    return await db.select()
      .from(menuItems)
      .where(eq(menuItems.featured, true))
      .orderBy(asc(menuItems.category_id), asc(menuItems.order));
  }

  // === GALERIA ===
  
  async getGalleryItems(): Promise<GalleryItem[]> {
    return await db.select()
      .from(galleryItems)
      .orderBy(asc(galleryItems.order));
  }
  
  async getGalleryItem(id: number): Promise<GalleryItem | undefined> {
    const [item] = await db.select()
      .from(galleryItems)
      .where(eq(galleryItems.id, id));
    
    return item;
  }
  
  async createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem> {
    const [newItem] = await db.insert(galleryItems)
      .values(item)
      .returning();
    
    return newItem;
  }
  
  async updateGalleryItem(id: number, item: Partial<InsertGalleryItem>): Promise<GalleryItem | undefined> {
    const [updatedItem] = await db.update(galleryItems)
      .set(item)
      .where(eq(galleryItems.id, id))
      .returning();
    
    return updatedItem;
  }
  
  async deleteGalleryItem(id: number): Promise<boolean> {
    const [deletedItem] = await db.delete(galleryItems)
      .where(eq(galleryItems.id, id))
      .returning();
    
    return !!deletedItem;
  }
  
  async getActiveGalleryItems(): Promise<GalleryItem[]> {
    return await db.select()
      .from(galleryItems)
      .where(eq(galleryItems.active, true))
      .orderBy(asc(galleryItems.order));
  }
}

// Use a classe DatabaseStorage
export const storage = new DatabaseStorage();
