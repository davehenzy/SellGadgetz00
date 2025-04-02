import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  phone: true,
});

// Laptop Status Enum
export const laptopStatusEnum = pgEnum('laptop_status', ['pending', 'approved', 'sold', 'rejected']);

// Laptop Listings Schema
export const laptops = pgTable("laptops", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  processor: text("processor").notNull(),
  ram: text("ram").notNull(),
  storage: text("storage").notNull(),
  display: text("display").notNull(),
  condition: text("condition").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  status: text("status", { enum: ['pending', 'approved', 'sold', 'rejected'] }).default('pending').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLaptopSchema = createInsertSchema(laptops).pick({
  userId: true,
  title: true,
  brand: true,
  model: true,
  processor: true,
  ram: true,
  storage: true,
  display: true,
  condition: true,
  description: true,
  price: true,
  images: true,
});

// Repair Request Status Enum
export const repairStatusEnum = pgEnum('repair_status', ['pending', 'diagnosed', 'in_progress', 'completed', 'cancelled']);

// Repair Requests Schema
export const repairs = pgTable("repairs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  issueType: text("issue_type").notNull(),
  description: text("description").notNull(),
  images: jsonb("images").$type<string[]>(),
  estimatedCost: integer("estimated_cost"),
  status: text("status", { enum: ['pending', 'diagnosed', 'in_progress', 'completed', 'cancelled'] }).default('pending').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRepairSchema = createInsertSchema(repairs).pick({
  userId: true,
  brand: true,
  model: true,
  issueType: true,
  description: true,
  images: true,
});

// Invoices Schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  repairId: integer("repair_id").references(() => repairs.id),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ['paid', 'unpaid'] }).default('unpaid').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  userId: true,
  repairId: true,
  amount: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Laptop = typeof laptops.$inferSelect;
export type InsertLaptop = z.infer<typeof insertLaptopSchema>;

export type Repair = typeof repairs.$inferSelect;
export type InsertRepair = z.infer<typeof insertRepairSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
