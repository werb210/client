import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertApplicationSchema, updateApplicationSchema, insertDocumentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { TwilioService } from "./twilioService";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Validation schemas
  const registrationSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    phoneNumber: z.string().regex(/^\+1\d{10}$/, "Phone number must be in format +1XXXXXXXXXX")
  });

  const sendCodeSchema = z.object({
    phone: z.string().regex(/^\+1\d{10}$/, "Phone number must be in format +1XXXXXXXXXX")
  });

  const verifyCodeSchema = z.object({
    phone: z.string().regex(/^\+1\d{10}$/, "Phone number must be in format +1XXXXXXXXXX"),
    code: z.string().length(6, "Code must be 6 digits")
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Registration route for new users to provide their information
  app.post('/api/auth/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = registrationSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: validation.error.errors 
        });
      }

      const { firstName, lastName, email, phoneNumber } = validation.data;
      
      // Update user with registration information
      const updatedUser = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        phoneNumber,
        is2FAEnabled: false // Will be enabled after phone verification
      });

      // Automatically send 2FA code to the registered phone number
      const result = await TwilioService.sendVerificationCode(userId, phoneNumber);
      
      if (result.success) {
        res.json({ 
          message: "Registration successful. Verification code sent to your phone.",
          user: updatedUser 
        });
      } else {
        // Registration succeeded but SMS failed - still allow user to proceed
        res.json({ 
          message: "Registration successful. Please try requesting a verification code manually.",
          user: updatedUser,
          smsError: result.error
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Failed to complete registration" });
    }
  });

  // 2FA routes
  app.post('/api/2fa/send', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = sendCodeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid phone number format", 
          errors: validation.error.errors 
        });
      }

      const { phone } = validation.data;
      const result = await TwilioService.sendVerificationCode(userId, phone);
      
      if (result.success) {
        res.json({ message: "Verification code sent successfully" });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("Error sending 2FA code:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post('/api/2fa/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = verifyCodeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.errors 
        });
      }

      const { phone, code } = validation.data;
      const result = await TwilioService.verifyCode(userId, phone, code);
      
      if (result.success) {
        // Mark session as 2FA complete
        (req.session as any).twoFactorComplete = true;
        res.json({ message: "2FA verification successful" });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      res.status(500).json({ message: "Failed to verify code" });
    }
  });

  app.get('/api/2fa/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const twoFactorComplete = (req.session as any).twoFactorComplete || false;
      
      res.json({
        is2FAEnabled: user?.is2FAEnabled || false,
        phoneNumber: user?.phoneNumber,
        twoFactorComplete
      });
    } catch (error) {
      console.error("Error checking 2FA status:", error);
      res.status(500).json({ message: "Failed to check 2FA status" });
    }
  });

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getApplicationsByUserId(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const application = await storage.getApplication(id, userId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        userId,
      });
      
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.patch('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const validatedData = updateApplicationSchema.parse(req.body);
      
      const application = await storage.updateApplication(id, userId, validatedData);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.delete('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteApplication(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // Document routes
  app.get('/api/applications/:id/documents', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const documents = await storage.getDocumentsByApplicationId(applicationId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/applications/:id/documents', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // In production, you would upload to a cloud storage service like AWS S3
      // For now, we'll just store the file path
      const fileUrl = `/uploads/${file.filename}`;
      
      const documentData = {
        applicationId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        fileUrl,
      };
      
      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      
      res.status(201).json(document);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocument(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Lender product routes
  app.get('/api/lender-products', isAuthenticated, async (req: any, res) => {
    try {
      const products = await storage.getLenderProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching lender products:", error);
      res.status(500).json({ message: "Failed to fetch lender products" });
    }
  });

  app.get('/api/lender-products/:type', isAuthenticated, async (req: any, res) => {
    try {
      const type = req.params.type;
      const products = await storage.getLenderProductsByType(type);
      res.json(products);
    } catch (error) {
      console.error("Error fetching lender products by type:", error);
      res.status(500).json({ message: "Failed to fetch lender products" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
