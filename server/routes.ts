import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertLaptopSchema, 
  insertRepairSchema, 
  insertInvoiceSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertChatParticipantSchema
} from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Users Routes
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Laptops Routes
  app.get("/api/laptops", async (req, res) => {
    try {
      const laptops = await storage.getAllLaptops();
      res.json(laptops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch laptops" });
    }
  });

  app.get("/api/laptops/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const laptops = await storage.getLaptopsByUserId(req.user.id);
      res.json(laptops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user laptops" });
    }
  });

  app.get("/api/laptops/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const laptop = await storage.getLaptop(id);
      
      if (!laptop) {
        return res.status(404).json({ error: "Laptop not found" });
      }
      
      res.json(laptop);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch laptop" });
    }
  });

  app.post("/api/laptops", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const laptopData = {
        ...req.body,
        userId: req.user.id
      };
      
      const validatedData = insertLaptopSchema.parse(laptopData);
      const laptop = await storage.createLaptop(validatedData);
      
      res.status(201).json(laptop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create laptop listing" });
    }
  });

  app.put("/api/laptops/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user.isAdmin) return res.status(403).json({ error: "Admin access required" });
    
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'approved', 'sold', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updatedLaptop = await storage.updateLaptopStatus(id, status);
      
      if (!updatedLaptop) {
        return res.status(404).json({ error: "Laptop not found" });
      }
      
      res.json(updatedLaptop);
    } catch (error) {
      res.status(500).json({ error: "Failed to update laptop status" });
    }
  });

  // Repairs Routes
  app.get("/api/repairs", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
      const repairs = await storage.getAllRepairs();
      res.json(repairs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repairs" });
    }
  });

  app.get("/api/repairs/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const repairs = await storage.getRepairsByUserId(req.user.id);
      res.json(repairs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user repairs" });
    }
  });

  app.get("/api/repairs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const repair = await storage.getRepair(id);
      
      if (!repair) {
        return res.status(404).json({ error: "Repair request not found" });
      }
      
      // Check if user owns this repair or is admin
      if (repair.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(repair);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repair request" });
    }
  });

  app.post("/api/repairs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const repairData = {
        ...req.body,
        userId: req.user.id
      };
      
      const validatedData = insertRepairSchema.parse(repairData);
      const repair = await storage.createRepair(validatedData);
      
      res.status(201).json(repair);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create repair request" });
    }
  });

  app.put("/api/repairs/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'diagnosed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updatedRepair = await storage.updateRepairStatus(id, status);
      
      if (!updatedRepair) {
        return res.status(404).json({ error: "Repair request not found" });
      }
      
      res.json(updatedRepair);
    } catch (error) {
      res.status(500).json({ error: "Failed to update repair status" });
    }
  });

  app.put("/api/repairs/:id/estimate", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const { estimatedCost } = req.body;
      
      if (typeof estimatedCost !== 'number' || estimatedCost < 0) {
        return res.status(400).json({ error: "Invalid estimated cost" });
      }
      
      const updatedRepair = await storage.updateRepairEstimatedCost(id, estimatedCost);
      
      if (!updatedRepair) {
        return res.status(404).json({ error: "Repair request not found" });
      }
      
      res.json(updatedRepair);
    } catch (error) {
      res.status(500).json({ error: "Failed to update repair estimate" });
    }
  });

  // Invoices Routes
  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
      // This assumes you have an getAllInvoices method in your storage
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const invoices = await storage.getInvoicesByUserId(req.user.id);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    try {
      const invoiceData = req.body;
      
      const validatedData = insertInvoiceSchema.parse(invoiceData);
      const invoice = await storage.createInvoice(validatedData);
      
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['paid', 'unpaid'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Only admin or invoice owner can update status
      if (invoice.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedInvoice = await storage.updateInvoiceStatus(id, status);
      res.json(updatedInvoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to update invoice status" });
    }
  });

  // Chat Routes
  app.get("/api/chat/rooms", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const rooms = await storage.getChatRoomsByUserId(req.user.id);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  app.get("/api/chat/rooms/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const roomId = parseInt(req.params.id);
      const room = await storage.getChatRoom(roomId);
      
      if (!room) {
        return res.status(404).json({ error: "Chat room not found" });
      }
      
      // Check if user is a participant
      const participants = await storage.getChatRoomParticipants(roomId);
      const isParticipant = participants.some((p: {id: number}) => p.id === req.user.id);
      
      if (!isParticipant && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat room" });
    }
  });

  app.post("/api/chat/rooms", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const roomData = req.body;
      
      // Validate and create room
      const validatedData = insertChatRoomSchema.parse(roomData);
      const room = await storage.createChatRoom(validatedData);
      
      // Add the creator as a participant
      await storage.addChatParticipant({
        roomId: room.id,
        userId: req.user.id
      });
      
      // If this is a support room, add all admins as participants
      if (room.type === 'support') {
        const admins = await storage.getAllUsers();
        const adminUsers = admins.filter(user => user.isAdmin);
        
        // Add each admin to the room
        for (const admin of adminUsers) {
          if (admin.id !== req.user.id) { // Skip if already added as creator
            await storage.addChatParticipant({
              roomId: room.id,
              userId: admin.id
            });
          }
        }
      }
      
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create chat room" });
    }
  });

  app.get("/api/chat/rooms/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const roomId = parseInt(req.params.id);
      
      // Check if user is a participant
      const participants = await storage.getChatRoomParticipants(roomId);
      const isParticipant = participants.some((p: {id: number}) => p.id === req.user.id);
      
      if (!isParticipant && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const messages = await storage.getChatMessages(roomId);
      
      // Mark messages as read
      await storage.markChatMessagesAsRead(roomId, req.user.id);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/rooms/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const roomId = parseInt(req.params.id);
      
      // Check if user is a participant
      const participants = await storage.getChatRoomParticipants(roomId);
      const isParticipant = participants.some((p: {id: number}) => p.id === req.user.id);
      
      if (!isParticipant && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const messageData = {
        ...req.body,
        roomId,
        userId: req.user.id
      };
      
      const validatedData = insertChatMessageSchema.parse(messageData);
      const message = await storage.createChatMessage(validatedData);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create chat message" });
    }
  });

  app.get("/api/chat/unread", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const count = await storage.getUnreadMessageCount(req.user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread message count" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSockets for real-time chat
  // Use a distinct path for our WebSocket server to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/api/ws' });
  
  // Store connections by userId
  const clients = new Map();
  
  wss.on('connection', (ws, req) => {
    // At this point, the user must be authenticated
    // We'll use a token or cookie based mechanism to identify them
    // For now, we'll use a simple query parameter (in production, you'd use a proper authentication)
    const url = new URL(req.url || '', 'http://localhost');
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      ws.close();
      return;
    }
    
    // Store the connection
    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId).add(ws);
    
    ws.on('message', async (messageBuffer) => {
      try {
        const messageData = JSON.parse(messageBuffer.toString());
        
        // Validate the message
        if (!messageData.roomId || !messageData.message) {
          return;
        }
        
        // Store the message
        const savedMessage = await storage.createChatMessage({
          roomId: messageData.roomId,
          userId: parseInt(userId),
          message: messageData.message
        });
        
        // Get room participants to broadcast the message
        const participants = await storage.getChatRoomParticipants(messageData.roomId);
        
        // Broadcast to all participants
        participants.forEach(participant => {
          const participantConnections = clients.get(participant.id.toString());
          if (participantConnections) {
            participantConnections.forEach((conn: WebSocket) => {
              if (conn.readyState === 1) { // OPEN
                conn.send(JSON.stringify(savedMessage));
              }
            });
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove the connection
      const userConnections = clients.get(userId);
      if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
          clients.delete(userId);
        }
      }
    });
  });
  
  return httpServer;
}
