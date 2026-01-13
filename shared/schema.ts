import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  role: text("role").notNull().default("farmer"), // "farmer", "buyer", "fpo", "admin"
  isVerified: boolean("is_verified").default(false),
  // Role-specific profiles stored as JSON
  farmerProfile: jsonb("farmer_profile"), // { landSize, soilType, farmingMethod, ... }
  buyerProfile: jsonb("buyer_profile"), // { businessName, demandHistory, ... }
  fpoProfile: jsonb("fpo_profile"), // { registrationNumber, memberCount, ... }
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  cropId: integer("crop_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  quantity: integer("quantity").notNull(), // in grams
  totalAmount: integer("total_amount").notNull(), // in paisa
  status: text("status").notNull().default("pending"), // pending, processing, in_transit, delivered
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fpoMembers = pgTable("fpo_members", {
  id: serial("id").primaryKey(),
  fpoId: integer("fpo_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const cropIntelligence = pgTable("crop_intelligence", {
  id: serial("id").primaryKey(),
  cropName: text("crop_name").notNull().unique(),
  soilRequirements: text("soil_requirements"),
  climate: text("climate"),
  sowingWindow: text("sowing_window"),
  harvestWindow: text("harvest_window"),
  diseases: text("diseases"), // JSON or text description
  pestManagement: text("pest_management"),
  yieldInfo: text("yield_info"),
});

export const marketplaceRequirements = pgTable("marketplace_requirements", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  cropName: text("crop_name").notNull(),
  quantityRequired: integer("quantity_required").notNull(),
  priceRange: text("price_range"), // e.g. "20-30"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  location: true,
  role: true,
  farmerProfile: true,
  buyerProfile: true,
  fpoProfile: true,
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

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
});

export const insertRequirementSchema = createInsertSchema(marketplaceRequirements).pick({
  buyerId: true,
  cropName: true,
  quantityRequired: true,
  priceRange: true,
  description: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCrop = z.infer<typeof insertCropSchema>;
export type Crop = typeof crops.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type MarketplaceRequirement = typeof marketplaceRequirements.$inferSelect;

export type CropIntel = typeof cropIntelligence.$inferSelect;

export const insertCropIntelligenceSchema = createInsertSchema(cropIntelligence).pick({
  cropName: true,
  soilRequirements: true,
  climate: true,
  sowingWindow: true,
  harvestWindow: true,
  diseases: true,
  pestManagement: true,
  yieldInfo: true,
});

export type InsertCropIntel = z.infer<typeof insertCropIntelligenceSchema>;

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
