import { users, crops, orders, type User, type InsertUser, type Crop, type InsertCrop, type Order, type InsertOrder } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
  
  // Session store
  sessionStore: Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private crops: Map<number, Crop>;
  private orders: Map<number, Order>;
  sessionStore: Store;
  
  private userId: number;
  private cropId: number;
  private orderId: number;

  constructor() {
    this.users = new Map();
    this.crops = new Map();
    this.orders = new Map();
    this.userId = 1;
    this.cropId = 1;
    this.orderId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    
    // Create a properly typed User object
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName,
      email: insertUser.email,
      phone: insertUser.phone,
      location: insertUser.location,
      userType: insertUser.userType,
      isVerified: false,
      createdAt: new Date()
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isVerified };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Crop methods
  async getCrop(id: number): Promise<Crop | undefined> {
    return this.crops.get(id);
  }

  async getCropsByFarmer(farmerId: number): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(
      (crop) => crop.farmerId === farmerId,
    );
  }

  async getAllCrops(): Promise<Crop[]> {
    return Array.from(this.crops.values());
  }

  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const id = this.cropId++;
    
    // Create a properly typed Crop object
    const crop: Crop = {
      id,
      name: insertCrop.name,
      category: insertCrop.category,
      farmerId: insertCrop.farmerId,
      currentPrice: insertCrop.currentPrice,
      quantity: insertCrop.quantity,
      location: insertCrop.location,
      isActive: true,
      createdAt: new Date(),
      plantedDate: insertCrop.plantedDate || null,
      harvestDate: insertCrop.harvestDate || null,
      storageInfo: insertCrop.storageInfo || null,
      description: insertCrop.description || null
    };
    
    this.crops.set(id, crop);
    return crop;
  }

  async updateCrop(id: number, cropData: Partial<Crop>): Promise<Crop | undefined> {
    const crop = this.crops.get(id);
    if (!crop) return undefined;
    
    const updatedCrop = { ...crop, ...cropData };
    this.crops.set(id, updatedCrop);
    return updatedCrop;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByBuyer(buyerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.buyerId === buyerId,
    );
  }

  async getOrdersByFarmer(farmerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.farmerId === farmerId,
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    
    // Create a properly typed Order object
    const order: Order = {
      id,
      buyerId: insertOrder.buyerId,
      cropId: insertOrder.cropId,
      farmerId: insertOrder.farmerId,
      quantity: insertOrder.quantity,
      totalAmount: insertOrder.totalAmount,
      status: "pending",
      createdAt: new Date()
    };
    
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
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
    // Handle nullable fields by ensuring they're not undefined
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
}

// Use Database storage
export const storage = new DatabaseStorage();
