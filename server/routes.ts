import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { getAIResponse, getPricePrediction } from "./openai";
import { insertCropSchema, insertOrderSchema, insertMessageSchema, insertCropIntelligenceSchema, insertRequirementSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // API Routes
  // Crops
  app.get("/api/crops", async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      
      const crops = await storage.getAllCrops();
      const paginatedCrops = crops.slice(offset, offset + limit);
      
      res.json({
        data: paginatedCrops,
        total: crops.length,
        limit,
        offset
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch crops" });
    }
  });

  // AI Assistant Chat
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required and must be a string" });
      }

      if (message.trim().length === 0) {
        return res.status(400).json({ message: "Message cannot be empty" });
      }

      const response = await getAIResponse(message.trim());
      res.json({ response });
    } catch (error: any) {
      console.error("[AI Chat Error]:", error);
      res.status(500).json({ message: "Failed to get AI response. Please try again later." });
    }
  });

  app.get("/api/crops/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid crop ID" });
    }

    const crop = await storage.getCrop(id);
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.json(crop);
  });

  app.get("/api/crops/farmer/:farmerId", async (req: Request, res: Response) => {
    const farmerId = parseInt(req.params.farmerId);
    if (isNaN(farmerId)) {
      return res.status(400).json({ message: "Invalid farmer ID" });
    }

    const crops = await storage.getCropsByFarmer(farmerId);
    res.json(crops);
  });

  app.post("/api/crops", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "farmer") {
      return res.status(403).json({ message: "Only farmers can create crops" });
    }

    try {
      const cropData = insertCropSchema.parse(req.body);

      // Ensure farmerId matches the authenticated user
      if (cropData.farmerId !== req.user.id) {
        return res.status(403).json({ message: "You can only create crops for yourself" });
      }

      const crop = await storage.createCrop(cropData);
      res.status(201).json(crop);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid crop data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create crop" });
    }
  });

  // ... (existing routes but using role)

  // New Routes

  // FPO
  app.get("/api/fpo/stats/:fpoId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Optional: check if user belongs to this FPO or is the FPO admin
    const stats = await storage.getFpoStats(parseInt(req.params.fpoId));
    res.json(stats);
  });

  app.get("/api/fpo/members/:fpoId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const members = await storage.getFpoMembers(parseInt(req.params.fpoId));
    res.json(members);
  });

  app.post("/api/fpo/members", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "fpo") return res.sendStatus(403);

    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username is required" });

    const farmer = await storage.getUserByUsername(username);
    if (!farmer) return res.status(404).json({ message: "User not found" });
    if (farmer.role !== "farmer") return res.status(400).json({ message: "User is not a farmer" });

    try {
      await storage.addFpoMember(req.user.id, farmer.id);
      res.sendStatus(201);
    } catch (error) {
      res.status(400).json({ message: "Failed to add member. They might already be a member." });
    }
  });

  // Marketplace
  app.get("/api/marketplace/requirements", async (req: Request, res: Response) => {
    try {
      const reqs = await storage.getRequirements();
      res.json(reqs);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch requirements" });
    }
  });

  // Crop Intelligence
  app.get("/api/crop-intelligence", async (req: Request, res: Response) => {
    const intel = await storage.getAllCropIntelligence();
    res.json(intel);
  });

  // Analytics - Price Trends (Mock Data)
  app.get("/api/analytics/prices/:cropId", async (req: Request, res: Response) => {
    const cropId = parseInt(req.params.cropId);
    if (isNaN(cropId)) return res.status(400).json({ message: "Invalid crop ID" });

    // Mock data generation: last 30 days
    const data = [];
    const today = new Date();
    // Base price around 20-50
    let currentPrice = 30 + Math.random() * 20;

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Random fluctuation
      const change = (Math.random() - 0.5) * 5;
      currentPrice += change;
      if (currentPrice < 10) currentPrice = 10; // floor

      data.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(currentPrice.toFixed(2))
      });
    }

    res.json(data);
  });

  app.get("/api/crop-intelligence/:cropName", async (req: Request, res: Response) => {
    const intel = await storage.getCropIntelligence(req.params.cropName);
    if (!intel) return res.status(404).json({ message: "Crop intelligence data not found" });
    res.json(intel);
  });

  app.post("/api/crop-intelligence", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Allow FPO and Admin to add data
    if (req.user.role !== "fpo" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only FPOs and Admins can add crop intelligence data" });
    }

    try {
      const data = insertCropIntelligenceSchema.parse(req.body);
      // Check if already exists
      const existing = await storage.getCropIntelligence(data.cropName);
      if (existing) {
        return res.status(400).json({ message: "Data for this crop already exists" });
      }

      const intel = await storage.createCropIntelligence(data);
      res.status(201).json(intel);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create crop intelligence data" });
    }
  });

  // Messages
  app.get("/api/messages/:userId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const msgs = await storage.getMessages(req.user.id, parseInt(req.params.userId));
    res.json(msgs);
  });

  app.post("/api/messages", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Create message data with current user as sender
      const messageData = {
        ...req.body,
        senderId: req.user.id,
        // Ensure receiverId is a number
        receiverId: parseInt(req.body.receiverId),
      };

      const validatedData = insertMessageSchema.parse(messageData);

      const message = await storage.sendMessage(validatedData);
      res.status(201).json(message);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch("/api/crops/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid crop ID" });
    }

    const crop = await storage.getCrop(id);
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    // Check ownership
    if (crop.farmerId !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own crops" });
    }

    try {
      const updatedCrop = await storage.updateCrop(id, req.body);
      res.json(updatedCrop);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update crop" });
    }
  });

  // Orders
  app.get("/api/orders/buyer", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can view their orders" });
    }

    const orders = await storage.getOrdersByBuyer(req.user.id);
    res.json(orders);
  });

  app.get("/api/orders/farmer", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "farmer") {
      return res.status(403).json({ message: "Only farmers can view their orders" });
    }

    const orders = await storage.getOrdersByFarmer(req.user.id);
    res.json(orders);
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can create orders" });
    }

    try {
      const orderData = insertOrderSchema.parse(req.body);

      // Ensure buyerId matches the authenticated user
      if (orderData.buyerId !== req.user.id) {
        return res.status(403).json({ message: "You can only create orders for yourself" });
      }

      // Verify buyer is verified
      if (!req.user.isVerified) {
        return res.status(403).json({ message: "You need to be verified to place orders" });
      }

      const crop = await storage.getCrop(orderData.cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      // Check crop availability
      if (!crop.isActive) {
        return res.status(400).json({ message: "This crop is no longer available" });
      }

      // Check if farmerId matches crop owner
      if (crop.farmerId !== orderData.farmerId) {
        return res.status(400).json({ message: "Invalid farmer ID for the crop" });
      }

      // Check if quantity is available
      if (crop.quantity < orderData.quantity) {
        return res.status(400).json({ message: "Requested quantity exceeds available quantity" });
      }

      // Create order
      const order = await storage.createOrder(orderData);

      // Update crop quantity
      await storage.updateCrop(crop.id, {
        quantity: crop.quantity - orderData.quantity,
        isActive: (crop.quantity - orderData.quantity) > 0
      });

      res.status(201).json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const { status } = req.body;
    if (!status || typeof status !== "string" || !["pending", "processing", "in_transit", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only farmers can update order status
    if (req.user.role !== "farmer" || order.farmerId !== req.user.id) {
      return res.status(403).json({ message: "Only the farmer who owns this order can update its status" });
    }

    try {
      const updatedOrder = await storage.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Market data
  app.get("/api/market/trends/:crop/:region", async (req: Request, res: Response) => {
    try {
      const { crop, region } = req.params;

      const pricePrediction = await getPricePrediction(crop, region);
      res.json(pricePrediction);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get market trends" });
    }
  });

  // AI Chatbot (Alias for /api/ai/chat for backward compatibility)
  app.post("/api/chat", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Invalid message. Message must be a non-empty string." });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    try {
      const response = await getAIResponse(message.trim());
      res.json({ response });
    } catch (error: any) {
      console.error("[Chat Error]:", error);
      res.status(500).json({ message: "Failed to process your message. Please try again later." });
    }
  });

  const httpServer = createServer(app);

  // Admin Stats
  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") return res.sendStatus(403);
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  app.get("/api/admin/users/recent", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") return res.sendStatus(403);
    const users = await storage.getRecentUsers(5);
    res.json(users);
  });

  return httpServer;
}
