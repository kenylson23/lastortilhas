import { pgTable, text, serial, integer, boolean, date, time, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(), // 'user', 'admin'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
}).extend({
  role: z.enum(["user", "admin"]).default("user").optional(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guests: text("guests").notNull(),
  message: text("message"),
  status: text("status").default("pendente"), // pendente, confirmada, cancelada
  created_at: timestamp("created_at").defaultNow(),
});

export const insertReservationSchema = createInsertSchema(reservations).pick({
  name: true,
  phone: true,
  date: true,
  time: true,
  guests: true,
  message: true,
});

// Tabela para categorias de menu
export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  order: integer("order").default(0),
});

export const insertMenuCategorySchema = createInsertSchema(menuCategories).pick({
  name: true,
  description: true,
  order: true,
});

// Tabela para itens do menu
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  image: text("image"),
  category_id: integer("category_id").references(() => menuCategories.id, { onDelete: 'cascade' }).notNull(),
  spicy_level: integer("spicy_level").default(0), // 0-5
  featured: boolean("featured").default(false),
  vegetarian: boolean("vegetarian").default(false),
  available: boolean("available").default(true),
  order: integer("order").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  name: true,
  description: true,
  price: true,
  image: true,
  category_id: true,
  spicy_level: true,
  featured: true,
  vegetarian: true,
  available: true,
  order: true,
});

// Tipos
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;

export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;
export type MenuCategory = typeof menuCategories.$inferSelect;

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
