import { users, laptops, repairs, invoices } from "@shared/schema";
import type { User, InsertUser, Laptop, InsertLaptop, Repair, InsertRepair, Invoice, InsertInvoice } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Laptop operations
  getLaptop(id: number): Promise<Laptop | undefined>;
  getLaptopsByUserId(userId: number): Promise<Laptop[]>;
  getAllLaptops(): Promise<Laptop[]>;
  createLaptop(laptop: InsertLaptop): Promise<Laptop>;
  updateLaptopStatus(id: number, status: string): Promise<Laptop | undefined>;
  
  // Repair operations
  getRepair(id: number): Promise<Repair | undefined>;
  getRepairsByUserId(userId: number): Promise<Repair[]>;
  getAllRepairs(): Promise<Repair[]>;
  createRepair(repair: InsertRepair): Promise<Repair>;
  updateRepairStatus(id: number, status: string): Promise<Repair | undefined>;
  updateRepairEstimatedCost(id: number, estimatedCost: number): Promise<Repair | undefined>;
  
  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private laptops: Map<number, Laptop>;
  private repairs: Map<number, Repair>;
  private invoices: Map<number, Invoice>;
  private userId: number;
  private laptopId: number;
  private repairId: number;
  private invoiceId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.laptops = new Map();
    this.repairs = new Map();
    this.invoices = new Map();
    this.userId = 1;
    this.laptopId = 1;
    this.repairId = 1;
    this.invoiceId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add a default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // This will be hashed in auth.ts
      email: "admin@sellgadgetz.com",
      fullName: "Admin User",
      phone: "1234567890"
    }).then(user => {
      // Manually set admin status for the admin user
      const adminUser = { ...user, isAdmin: true };
      this.users.set(user.id, adminUser);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: false,
      createdAt
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Laptop operations
  async getLaptop(id: number): Promise<Laptop | undefined> {
    return this.laptops.get(id);
  }

  async getLaptopsByUserId(userId: number): Promise<Laptop[]> {
    return Array.from(this.laptops.values()).filter(
      (laptop) => laptop.userId === userId
    );
  }

  async getAllLaptops(): Promise<Laptop[]> {
    return Array.from(this.laptops.values());
  }

  async createLaptop(insertLaptop: InsertLaptop): Promise<Laptop> {
    const id = this.laptopId++;
    const createdAt = new Date();
    const laptop: Laptop = { 
      ...insertLaptop, 
      id, 
      status: 'pending',
      createdAt
    };
    this.laptops.set(id, laptop);
    return laptop;
  }

  async updateLaptopStatus(id: number, status: string): Promise<Laptop | undefined> {
    const laptop = this.laptops.get(id);
    if (!laptop) return undefined;
    
    const updatedLaptop = { ...laptop, status };
    this.laptops.set(id, updatedLaptop);
    return updatedLaptop;
  }

  // Repair operations
  async getRepair(id: number): Promise<Repair | undefined> {
    return this.repairs.get(id);
  }

  async getRepairsByUserId(userId: number): Promise<Repair[]> {
    return Array.from(this.repairs.values()).filter(
      (repair) => repair.userId === userId
    );
  }

  async getAllRepairs(): Promise<Repair[]> {
    return Array.from(this.repairs.values());
  }

  async createRepair(insertRepair: InsertRepair): Promise<Repair> {
    const id = this.repairId++;
    const createdAt = new Date();
    const repair: Repair = { 
      ...insertRepair, 
      id, 
      estimatedCost: null,
      status: 'pending',
      createdAt
    };
    this.repairs.set(id, repair);
    return repair;
  }

  async updateRepairStatus(id: number, status: string): Promise<Repair | undefined> {
    const repair = this.repairs.get(id);
    if (!repair) return undefined;
    
    const updatedRepair = { ...repair, status };
    this.repairs.set(id, updatedRepair);
    return updatedRepair;
  }

  async updateRepairEstimatedCost(id: number, estimatedCost: number): Promise<Repair | undefined> {
    const repair = this.repairs.get(id);
    if (!repair) return undefined;
    
    const updatedRepair = { ...repair, estimatedCost };
    this.repairs.set(id, updatedRepair);
    return updatedRepair;
  }

  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.userId === userId
    );
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceId++;
    const createdAt = new Date();
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      status: 'unpaid',
      createdAt
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, status };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
}

export const storage = new MemStorage();
