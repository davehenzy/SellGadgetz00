import { users, laptops, repairs, invoices } from "@shared/schema";
import type { User, InsertUser, Laptop, InsertLaptop, Repair, InsertRepair, Invoice, InsertInvoice } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import pg from 'pg';
import connectPg from 'connect-pg-simple';
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const { Pool } = pg;

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

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
  sessionStore: any;
  
  // Database utilities
  initDb(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private pool: Pool;
  private db: any;
  sessionStore: any;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.db = drizzle(this.pool);
    
    this.sessionStore = new PostgresSessionStore({
      pool: this.pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  async initDb() {
    console.log("Initializing database...");
    
    // Create enums and tables
    await this.pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'laptop_status') THEN
          CREATE TYPE laptop_status AS ENUM ('pending', 'approved', 'sold', 'rejected');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'repair_status') THEN
          CREATE TYPE repair_status AS ENUM ('pending', 'diagnosed', 'in_progress', 'completed', 'cancelled');
        END IF;
      END $$;
      
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        phone TEXT,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS laptops (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        processor TEXT NOT NULL,
        ram TEXT NOT NULL,
        storage TEXT NOT NULL,
        display TEXT NOT NULL,
        condition TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        images JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS repairs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        issue_type TEXT NOT NULL,
        description TEXT NOT NULL,
        images JSONB,
        estimated_cost INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        repair_id INTEGER REFERENCES repairs(id),
        amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'unpaid',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Check if admin user exists
    const adminUser = await this.getUserByUsername('admin');
    
    if (!adminUser) {
      console.log("Creating admin user...");
      // Create admin user
      await this.createUser({
        username: "admin",
        password: await hashPassword("admin123"),
        email: "admin@sellgadgetz.com",
        fullName: "Admin User",
        phone: "1234567890"
      });
      
      // Update admin status
      await this.pool.query(
        "UPDATE users SET is_admin = TRUE WHERE username = 'admin'"
      );
    }
    
    console.log("Database initialized successfully");
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  // Laptop operations
  async getLaptop(id: number): Promise<Laptop | undefined> {
    const result = await this.db.select().from(laptops).where(eq(laptops.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getLaptopsByUserId(userId: number): Promise<Laptop[]> {
    return await this.db.select().from(laptops).where(eq(laptops.userId, userId));
  }

  async getAllLaptops(): Promise<Laptop[]> {
    return await this.db.select().from(laptops);
  }

  async createLaptop(insertLaptop: InsertLaptop): Promise<Laptop> {
    const result = await this.db.insert(laptops).values(insertLaptop).returning();
    return result[0];
  }

  async updateLaptopStatus(id: number, status: string): Promise<Laptop | undefined> {
    const result = await this.db
      .update(laptops)
      .set({ status })
      .where(eq(laptops.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  // Repair operations
  async getRepair(id: number): Promise<Repair | undefined> {
    const result = await this.db.select().from(repairs).where(eq(repairs.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getRepairsByUserId(userId: number): Promise<Repair[]> {
    return await this.db.select().from(repairs).where(eq(repairs.userId, userId));
  }

  async getAllRepairs(): Promise<Repair[]> {
    return await this.db.select().from(repairs);
  }

  async createRepair(insertRepair: InsertRepair): Promise<Repair> {
    const result = await this.db.insert(repairs).values(insertRepair).returning();
    return result[0];
  }

  async updateRepairStatus(id: number, status: string): Promise<Repair | undefined> {
    const result = await this.db
      .update(repairs)
      .set({ status })
      .where(eq(repairs.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async updateRepairEstimatedCost(id: number, estimatedCost: number): Promise<Repair | undefined> {
    const result = await this.db
      .update(repairs)
      .set({ estimatedCost })
      .where(eq(repairs.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const result = await this.db.select().from(invoices).where(eq(invoices.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return await this.db.select().from(invoices).where(eq(invoices.userId, userId));
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const result = await this.db.insert(invoices).values(insertInvoice).returning();
    return result[0];
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const result = await this.db
      .update(invoices)
      .set({ status })
      .where(eq(invoices.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
}

// Export a single instance
export const storage = new DatabaseStorage();
