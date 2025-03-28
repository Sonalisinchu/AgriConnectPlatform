import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  userType: text("user_type").notNull(), // "farmer" or "buyer"
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // vegetables, fruits, grains, etc.
  farmerId: integer("farmer_id").notNull(),
  currentPrice: integer("current_price").notNull(), // in paisa (1/100 of rupee)
  quantity: integer("quantity").notNull(), // in grams
  plantedDate: timestamp("planted_date"),
  harvestDate: timestamp("harvest_date"),
  location: text("location").notNull(),
  storageInfo: text("storage_info"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  cropId: integer("crop_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  quantity: integer("quantity").notNull(), // in grams
  totalAmount: integer("total_amount").notNull(), // in paisa
  status: text("status").notNull().default("pending"), // pending, processing, in_transit, delivered
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  location: true,
  userType: true,
});

export const insertCropSchema = createInsertSchema(crops).pick({
  name: true,
  category: true,
  farmerId: true,
  currentPrice: true,
  quantity: true,
  plantedDate: true,
  harvestDate: true,
  location: true,
  storageInfo: true,
  description: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  buyerId: true,
  cropId: true,
  farmerId: true,
  quantity: true,
  totalAmount: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCrop = z.infer<typeof insertCropSchema>;
export type Crop = typeof crops.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Extend schemas for validation
export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
