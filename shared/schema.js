import { pgTable, text, serial, integer, boolean, date, time, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guests: text("guests").notNull(),
  message: text("message"),
  status: text("status").default("pendente"),
  user_id: integer("user_id").references(() => users.id),
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

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  image: text("image"),
  category_id: integer("category_id").references(() => menuCategories.id).notNull(),
  spicy_level: integer("spicy_level").default(0),
  vegetarian: boolean("vegetarian").default(false),
  featured: boolean("featured").default(false),
  order: integer("order").default(0),
  active: boolean("active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  name: true,
  description: true,
  price: true,
  image: true,
  category_id: true,
  spicy_level: true,
  vegetarian: true,
  featured: true,
  order: true,
  active: true,
});

export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  src: text("src").notNull(),
  order: integer("order").default(0),
  active: boolean("active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).pick({
  title: true,
  description: true,
  src: true,
  order: true,
  active: true,
});