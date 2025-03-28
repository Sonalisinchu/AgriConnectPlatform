import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { getAIResponse, getPricePrediction } from "./openai";
import { insertCropSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API Routes
  // Crops
  app.get("/api/crops", async (req, res) => {
    const crops = await storage.getAllCrops();
    res.json(crops);
  });
  
  app.get("/api/crops/:id", async (req, res) => {
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
  
  app.get("/api/crops/farmer/:farmerId", async (req, res) => {
    const farmerId = parseInt(req.params.farmerId);
    if (isNaN(farmerId)) {
      return res.status(400).json({ message: "Invalid farmer ID" });
    }
    
    const crops = await storage.getCropsByFarmer(farmerId);
    res.json(crops);
  });
  
  app.post("/api/crops", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.userType !== "farmer") {
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid crop data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create crop" });
    }
  });
  
  app.patch("/api/crops/:id", async (req, res) => {
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
    } catch (error) {
      res.status(500).json({ message: "Failed to update crop" });
    }
  });
  
  // Orders
  app.get("/api/orders/buyer", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.userType !== "buyer") {
      return res.status(403).json({ message: "Only buyers can view their orders" });
    }
    
    const orders = await storage.getOrdersByBuyer(req.user.id);
    res.json(orders);
  });
  
  app.get("/api/orders/farmer", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.userType !== "farmer") {
      return res.status(403).json({ message: "Only farmers can view their orders" });
    }
    
    const orders = await storage.getOrdersByFarmer(req.user.id);
    res.json(orders);
  });
  
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.userType !== "buyer") {
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  app.patch("/api/orders/:id/status", async (req, res) => {
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
    if (req.user.userType !== "farmer" || order.farmerId !== req.user.id) {
      return res.status(403).json({ message: "Only the farmer who owns this order can update its status" });
    }
    
    try {
      const updatedOrder = await storage.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // Market data
  app.get("/api/market/trends/:crop/:region", async (req, res) => {
    try {
      const { crop, region } = req.params;
      
      const pricePrediction = await getPricePrediction(crop, region);
      res.json(pricePrediction);
    } catch (error) {
      res.status(500).json({ message: "Failed to get market trends" });
    }
  });
  
  // AI Chatbot
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Invalid message" });
    }
    
    try {
      const response = await getAIResponse(message);
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
