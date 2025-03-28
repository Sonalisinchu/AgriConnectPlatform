import { users, crops, orders, type User, type InsertUser, type Crop, type InsertCrop, type Order, type InsertOrder } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private crops: Map<number, Crop>;
  private orders: Map<number, Order>;
  sessionStore: session.SessionStore;
  
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
    const user: User = { 
      ...insertUser, 
      id, 
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
    const crop: Crop = { 
      ...insertCrop, 
      id, 
      isActive: true,
      createdAt: new Date()
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
    const order: Order = { 
      ...insertOrder, 
      id, 
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

export const storage = new MemStorage();
