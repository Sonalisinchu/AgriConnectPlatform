import {
  users, crops, orders, fpoMembers, cropIntelligence, marketplaceRequirements, messages,
  type User, type InsertUser,
  type Crop, type InsertCrop,
  type Order, type InsertOrder,
  type Message, type InsertMessage,
  type MarketplaceRequirement, type InsertRequirement,
  type CropIntel, type InsertCropIntel
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { Store } from "express-session";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined>;

  // Crop methods
  getCrop(id: number): Promise<Crop | undefined>;
  getCropsByFarmer(farmerId: number): Promise<Crop[]>;
  getAllCrops(): Promise<Crop[]>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: number, crop: Partial<Crop>): Promise<Crop | undefined>;

  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByBuyer(buyerId: number): Promise<Order[]>;
  getOrdersByFarmer(farmerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // FPO methods
  addFpoMember(fpoId: number, farmerId: number): Promise<void>;
  getFpoMembers(fpoId: number): Promise<User[]>;

  // Crop Intelligence
  getCropIntelligence(cropName: string): Promise<CropIntel | undefined>;
  getAllCropIntelligence(): Promise<CropIntel[]>;
  createCropIntelligence(intel: InsertCropIntel): Promise<CropIntel>;

  // Marketplace
  createRequirement(req: InsertRequirement): Promise<MarketplaceRequirement>;
  getRequirements(): Promise<MarketplaceRequirement[]>;

  // Messages
  sendMessage(msg: InsertMessage): Promise<Message>;
  getMessages(userId1: number, userId2: number): Promise<Message[]>;

  // Dashboard Stats
  getAdminStats(): Promise<{ totalUsers: number; totalCrops: number; totalOrders: number; totalRevenue: number }>;
  getRecentUsers(limit: number): Promise<User[]>;
  getFpoStats(fpoId: number): Promise<{ totalMembers: number; activeCrops: number; totalRevenue: number }>;

  // Session store
  sessionStore: Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL as string,
      tableName: 'session',
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values({
        ...insertUser,
        isVerified: false
      })
      .returning();
    return user;
  }

  async updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ isVerified })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Crop methods
  async getCrop(id: number): Promise<Crop | undefined> {
    const [crop] = await db.select().from(crops).where(eq(crops.id, id));
    return crop;
  }

  async getCropsByFarmer(farmerId: number): Promise<Crop[]> {
    return db.select().from(crops).where(eq(crops.farmerId, farmerId));
  }

  async getAllCrops(): Promise<Crop[]> {
    return db.select().from(crops);
  }

  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const cropValues = {
      ...insertCrop,
      isActive: true,
      plantedDate: insertCrop.plantedDate || null,
      harvestDate: insertCrop.harvestDate || null,
      storageInfo: insertCrop.storageInfo || null,
      description: insertCrop.description || null
    };

    const [crop] = await db.insert(crops)
      .values(cropValues)
      .returning();
    return crop;
  }

  async updateCrop(id: number, cropData: Partial<Crop>): Promise<Crop | undefined> {
    const [crop] = await db.update(crops)
      .set(cropData)
      .where(eq(crops.id, id))
      .returning();
    return crop;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByBuyer(buyerId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.buyerId, buyerId));
  }

  async getOrdersByFarmer(farmerId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.farmerId, farmerId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders)
      .values({
        ...insertOrder,
        status: "pending"
      })
      .returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // FPO Methods
  async addFpoMember(fpoId: number, farmerId: number): Promise<void> {
    await db.insert(fpoMembers).values({ fpoId, farmerId });
  }

  async getFpoMembers(fpoId: number): Promise<User[]> {
    // Join users and fpoMembers
    const results = await db.select({ user: users })
      .from(fpoMembers)
      .innerJoin(users, eq(users.id, fpoMembers.farmerId))
      .where(eq(fpoMembers.fpoId, fpoId));

    return results.map((r: { user: User }) => r.user);
  }

  // Crop Intelligence
  async getCropIntelligence(cropName: string): Promise<CropIntel | undefined> {
    const [intel] = await db.select().from(cropIntelligence).where(eq(cropIntelligence.cropName, cropName));
    return intel;
  }

  async getAllCropIntelligence(): Promise<CropIntel[]> {
    return db.select().from(cropIntelligence);
  }

  async createCropIntelligence(intel: InsertCropIntel): Promise<CropIntel> {
    const [newIntel] = await db.insert(cropIntelligence).values(intel).returning();
    return newIntel;
  }

  // Marketplace
  async createRequirement(req: InsertRequirement): Promise<MarketplaceRequirement> {
    const [requirement] = await db.insert(marketplaceRequirements).values(req).returning();
    return requirement;
  }

  async getRequirements(): Promise<MarketplaceRequirement[]> {
    return db.select().from(marketplaceRequirements).where(eq(marketplaceRequirements.isActive, true));
  }

  // Messages
  async sendMessage(msg: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(msg).returning();
    return message;
  }

  async getMessages(userId1: number, userId2: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(desc(messages.createdAt));
  }
  // Dashboard Stats
  async getAdminStats(): Promise<{ totalUsers: number; totalCrops: number; totalOrders: number; totalRevenue: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [cropCount] = await db.select({ count: sql<number>`count(*)` }).from(crops);
    const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [revenue] = await db.select({ total: sql<number>`sum(${orders.totalAmount})` }).from(orders);

    return {
      totalUsers: Number(userCount.count),
      totalCrops: Number(cropCount.count),
      totalOrders: Number(orderCount.count),
      totalRevenue: Number(revenue?.total || 0)
    };
  }

  async getRecentUsers(limit: number): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id)).limit(limit);
  }

  async getFpoStats(fpoId: number): Promise<{ totalMembers: number; activeCrops: number; totalRevenue: number }> {
    const [memberCount] = await db.select({ count: sql<number>`count(*)` })
      .from(fpoMembers)
      .where(eq(fpoMembers.fpoId, fpoId));

    const members = await this.getFpoMembers(fpoId);
    const memberIds = members.map(m => m.id);

    let activeCrops = 0;
    if (memberIds.length > 0) {
      const allCrops = await this.getAllCrops();
      activeCrops = allCrops.filter(c => memberIds.includes(c.farmerId)).length;
    }

    return {
      totalMembers: Number(memberCount.count),
      activeCrops: activeCrops,
      totalRevenue: 0
    };
  }
}

// Use Database storage
export const storage = new DatabaseStorage();
