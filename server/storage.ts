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
import { eq, and, ne, inArray, asc, count } from 'drizzle-orm';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db, initializeDatabase } from "./db";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  async initDb() {
    try {
      console.log("Initializing database...");
      await initializeDatabase();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Laptop operations
  async getLaptop(id: number): Promise<Laptop | undefined> {
    const result = await db.select().from(laptops).where(eq(laptops.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getLaptopsByUserId(userId: number): Promise<Laptop[]> {
    return await db.select().from(laptops).where(eq(laptops.userId, userId));
  }

  async getAllLaptops(): Promise<Laptop[]> {
    return await db.select().from(laptops);
  }

  async createLaptop(insertLaptop: InsertLaptop): Promise<Laptop> {
    const result = await db.insert(laptops).values(insertLaptop).returning();
    return result[0];
  }

  async updateLaptopStatus(id: number, status: string): Promise<Laptop | undefined> {
    const result = await db
      .update(laptops)
      .set({ status })
      .where(eq(laptops.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  // Repair operations
  async getRepair(id: number): Promise<Repair | undefined> {
    const result = await db.select().from(repairs).where(eq(repairs.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getRepairsByUserId(userId: number): Promise<Repair[]> {
    return await db.select().from(repairs).where(eq(repairs.userId, userId));
  }

  async getAllRepairs(): Promise<Repair[]> {
    return await db.select().from(repairs);
  }

  async createRepair(insertRepair: InsertRepair): Promise<Repair> {
    const result = await db.insert(repairs).values(insertRepair).returning();
    return result[0];
  }

  async updateRepairStatus(id: number, status: string): Promise<Repair | undefined> {
    const result = await db
      .update(repairs)
      .set({ status })
      .where(eq(repairs.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async updateRepairEstimatedCost(id: number, estimatedCost: number): Promise<Repair | undefined> {
    const result = await db
      .update(repairs)
      .set({ estimatedCost })
      .where(eq(repairs.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.userId, userId));
  }
  
  async getAllInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const result = await db.insert(invoices).values(insertInvoice).returning();
    return result[0];
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const result = await db
      .update(invoices)
      .set({ status })
      .where(eq(invoices.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  // Chat operations
  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    const result = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getChatRoomsByUserId(userId: number): Promise<ChatRoom[]> {
    // Get all rooms where user is a participant
    const participants = await db.select().from(chatParticipants).where(eq(chatParticipants.userId, userId));
    
    if (participants.length === 0) {
      return [];
    }

    const roomIds = participants.map((p: ChatParticipant) => p.roomId);
    return await db.select().from(chatRooms).where(inArray(chatRooms.id, roomIds));
  }

  async getChatRoomParticipants(roomId: number): Promise<User[]> {
    const participants = await db.select().from(chatParticipants).where(eq(chatParticipants.roomId, roomId));
    
    if (participants.length === 0) {
      return [];
    }

    const userIds = participants.map((p: ChatParticipant) => p.userId);
    return await db.select().from(users).where(inArray(users.id, userIds));
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const result = await db.insert(chatRooms).values(room).returning();
    return result[0];
  }

  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    // Check if participant already exists
    const existing = await db.select()
      .from(chatParticipants)
      .where(and(
        eq(chatParticipants.roomId, participant.roomId),
        eq(chatParticipants.userId, participant.userId)
      ));

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(chatParticipants).values(participant).returning();
    return result[0];
  }

  async getChatMessages(roomId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  async markChatMessagesAsRead(roomId: number, userId: number): Promise<void> {
    await db
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
    const participants = await db.select().from(chatParticipants).where(eq(chatParticipants.userId, userId));
    
    if (participants.length === 0) {
      return 0;
    }

    const roomIds = participants.map((p: ChatParticipant) => p.roomId);
    
    // Count unread messages in those rooms from other users
    const result = await db
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
    const result = await db.select().from(websiteContent).where(eq(websiteContent.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getWebsiteContentByType(type: string): Promise<WebsiteContent[]> {
    return await db
      .select()
      .from(websiteContent)
      .where(eq(websiteContent.type, type))
      .orderBy(asc(websiteContent.order));
  }

  async getAllWebsiteContent(): Promise<WebsiteContent[]> {
    return await db.select().from(websiteContent);
  }

  async createWebsiteContent(content: InsertWebsiteContent): Promise<WebsiteContent> {
    const result = await db.insert(websiteContent).values(content).returning();
    return result[0];
  }

  async updateWebsiteContent(id: number, content: Partial<InsertWebsiteContent>): Promise<WebsiteContent | undefined> {
    const result = await db
      .update(websiteContent)
      .set(content)
      .where(eq(websiteContent.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteWebsiteContent(id: number): Promise<void> {
    await db.delete(websiteContent).where(eq(websiteContent.id, id));
  }
}

export const storage = new DatabaseStorage();