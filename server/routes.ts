import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertLaptopSchema, insertRepairSchema, insertInvoiceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}
