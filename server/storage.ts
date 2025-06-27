import {
  users,
  applications,
  documents,
  lenderProducts,
  type User,
  type UpsertUser,
  type Application,
  type InsertApplication,
  type Document,
  type InsertDocument,
  type LenderProduct,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPhone(userId: string, phoneNumber: string): Promise<User | undefined>;
  
  // Application operations
  getApplicationsByUserId(userId: string): Promise<Application[]>;
  getApplication(id: number, userId: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, userId: string, updates: Partial<Application>): Promise<Application | undefined>;
  deleteApplication(id: number, userId: string): Promise<boolean>;
  
  // Document operations
  getDocumentsByApplicationId(applicationId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Lender product operations
  getLenderProducts(): Promise<LenderProduct[]>;
  getLenderProductsByType(type: string): Promise<LenderProduct[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Application operations
  async getApplicationsByUserId(userId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.updatedAt));
  }

  async getApplication(id: number, userId: string): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id) && eq(applications.userId, userId));
    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async updateApplication(id: number, userId: string, updates: Partial<Application>): Promise<Application | undefined> {
    const [updated] = await db
      .update(applications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applications.id, id) && eq(applications.userId, userId))
      .returning();
    return updated;
  }

  async deleteApplication(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(applications)
      .where(eq(applications.id, id) && eq(applications.userId, userId));
    return (result.rowCount || 0) > 0;
  }

  // Document operations
  async getDocumentsByApplicationId(applicationId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.applicationId, applicationId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(eq(documents.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Lender product operations
  async getLenderProducts(): Promise<LenderProduct[]> {
    return await db
      .select()
      .from(lenderProducts)
      .where(eq(lenderProducts.active, true));
  }

  async getLenderProductsByType(type: string): Promise<LenderProduct[]> {
    return await db
      .select()
      .from(lenderProducts)
      .where(eq(lenderProducts.type, type) && eq(lenderProducts.active, true));
  }
}

export const storage = new DatabaseStorage();
