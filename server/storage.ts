import { 
  users, laptops, repairs, invoices, 
  chatRooms, chatMessages, chatParticipants,
  websiteContent
} from "@shared/schema";
import type { 
  User, InsertUser, Laptop, InsertLaptop, Repair, InsertRepair, Invoice, InsertInvoice,
  ChatRoom, InsertChatRoom, ChatMessage, InsertChatMessage, ChatParticipant, InsertChatParticipant,
  WebsiteContent, InsertWebsiteContent
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, ne, inArray, asc, count } from 'drizzle-orm';
import pg from 'pg';
import connectPg from 'connect-pg-simple';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const { Pool } = pg;

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Password utilities
const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
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
  getAllInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  
  // Chat operations
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  getChatRoomsByUserId(userId: number): Promise<ChatRoom[]>;
  getChatRoomParticipants(roomId: number): Promise<User[]>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  getChatMessages(roomId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markChatMessagesAsRead(roomId: number, userId: number): Promise<void>;
  getUnreadMessageCount(userId: number): Promise<number>;
  
  // Website content operations
  getWebsiteContentById(id: number): Promise<WebsiteContent | undefined>;
  // Using any for type to avoid TypeScript errors with the enum type
  getWebsiteContentByType(type: any): Promise<WebsiteContent[]>;
  getAllWebsiteContent(): Promise<WebsiteContent[]>;
  createWebsiteContent(content: InsertWebsiteContent): Promise<WebsiteContent>;
  updateWebsiteContent(id: number, content: Partial<InsertWebsiteContent>): Promise<WebsiteContent | undefined>;
  deleteWebsiteContent(id: number): Promise<void>;
  
  // Session store
  sessionStore: any;
  
  // Database utilities
  initDb(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private pool: any;
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
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
          CREATE TYPE content_type AS ENUM ('hero', 'services', 'how_it_works', 'testimonials', 'faq', 'contact', 'footer');
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
      
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'support',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES chat_rooms(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS chat_participants (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES chat_rooms(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS website_content (
        id SERIAL PRIMARY KEY,
        type content_type NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        content TEXT NOT NULL,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        last_updated TIMESTAMP DEFAULT NOW()
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
  
  async getAllInvoices(): Promise<Invoice[]> {
    return await this.db.select().from(invoices);
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

  // Chat operations
  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    const result = await this.db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getChatRoomsByUserId(userId: number): Promise<ChatRoom[]> {
    // Get all rooms where user is a participant
    const participants = await this.db.select().from(chatParticipants).where(eq(chatParticipants.userId, userId));
    
    if (participants.length === 0) {
      return [];
    }

    const roomIds = participants.map((p: ChatParticipant) => p.roomId);
    return await this.db.select().from(chatRooms).where(inArray(chatRooms.id, roomIds));
  }

  async getChatRoomParticipants(roomId: number): Promise<User[]> {
    const participants = await this.db.select().from(chatParticipants).where(eq(chatParticipants.roomId, roomId));
    
    if (participants.length === 0) {
      return [];
    }

    const userIds = participants.map((p: ChatParticipant) => p.userId);
    return await this.db.select().from(users).where(inArray(users.id, userIds));
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const result = await this.db.insert(chatRooms).values(room).returning();
    return result[0];
  }

  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    // Check if participant already exists
    const existing = await this.db.select()
      .from(chatParticipants)
      .where(and(
        eq(chatParticipants.roomId, participant.roomId),
        eq(chatParticipants.userId, participant.userId)
      ));

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await this.db.insert(chatParticipants).values(participant).returning();
    return result[0];
  }

  async getChatMessages(roomId: number): Promise<ChatMessage[]> {
    return await this.db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await this.db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  async markChatMessagesAsRead(roomId: number, userId: number): Promise<void> {
    await this.db
      .update(chatMessages)
      .set({ read: true })
      .where(
        and(
          eq(chatMessages.roomId, roomId),
          ne(chatMessages.userId, userId), // Only mark messages from other users as read
          eq(chatMessages.read, false)
        )
      );
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    // First get all rooms this user is part of
    const participants = await this.db.select().from(chatParticipants).where(eq(chatParticipants.userId, userId));
    
    if (participants.length === 0) {
      return 0;
    }

    const roomIds = participants.map((p: ChatParticipant) => p.roomId);
    
    // Count unread messages in those rooms from other users
    const result = await this.db
      .select({ count: count() })
      .from(chatMessages)
      .where(
        and(
          inArray(chatMessages.roomId, roomIds),
          ne(chatMessages.userId, userId), // Messages from other users
          eq(chatMessages.read, false)     // That are unread
        )
      );
      
    return result[0]?.count || 0;
  }
  
  // Website content operations
  async getWebsiteContentById(id: number): Promise<WebsiteContent | undefined> {
    const result = await this.db.select().from(websiteContent).where(eq(websiteContent.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getWebsiteContentByType(type: string): Promise<WebsiteContent[]> {
    return await this.db
      .select()
      .from(websiteContent)
      .where(eq(websiteContent.type, type as any))
      .orderBy(asc(websiteContent.order));
  }
  
  async getAllWebsiteContent(): Promise<WebsiteContent[]> {
    return await this.db
      .select()
      .from(websiteContent)
      .orderBy(asc(websiteContent.type), asc(websiteContent.order));
  }
  
  async createWebsiteContent(content: InsertWebsiteContent): Promise<WebsiteContent> {
    const result = await this.db.insert(websiteContent).values(content).returning();
    return result[0];
  }
  
  async updateWebsiteContent(id: number, content: Partial<InsertWebsiteContent>): Promise<WebsiteContent | undefined> {
    console.log('Updating website content in DB:', id, content);
    
    // Ensure we're creating a clean update object with only the fields that were provided
    const updateData: Partial<Record<keyof typeof websiteContent.$inferInsert, any>> = {};
    if (content.type !== undefined) updateData.type = content.type;
    if (content.title !== undefined) updateData.title = content.title;
    if (content.content !== undefined) updateData.content = content.content;
    if (content.order !== undefined) updateData.order = content.order;
    
    // Add lastUpdated timestamp
    updateData.lastUpdated = new Date();
    
    console.log('Final update data:', updateData);
    
    const result = await this.db
      .update(websiteContent)
      .set(updateData)
      .where(eq(websiteContent.id, id))
      .returning();
      
    console.log('Update result:', result);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteWebsiteContent(id: number): Promise<void> {
    await this.db
      .delete(websiteContent)
      .where(eq(websiteContent.id, id));
  }
}

// Export a single instance
export const storage = new DatabaseStorage();
