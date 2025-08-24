// server/middleware/validation.ts - Input validation with Zod
import { z } from "zod";

// Application submission schema
export const ApplicationSchema = z.object({
  step1: z.object({
    requestedAmount: z.number().positive().max(50000000),
    fundingAmount: z.number().positive().max(50000000),
    use_of_funds: z.string().min(5).max(500),
    businessLocation: z.string().length(2),
    industry: z.string().min(2).max(100)
  }).optional(),
  step3: z.object({
    businessName: z.string().min(1).max(200),
    operatingName: z.string().min(1).max(200),
    legalName: z.string().min(1).max(200),
    businessType: z.string().min(2).max(50),
    industry: z.string().min(2).max(100),
    businessPhone: z.string().min(10).max(20)
  }).optional(),
  step4: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().max(200),
    applicantEmail: z.string().email().max(200),
    phone: z.string().min(10).max(20),
    applicantPhone: z.string().min(10).max(20)
  }).optional(),
  metadata: z.object({
    source: z.string().max(50).optional(),
    testSubmission: z.boolean().optional(),
    requestedAmount: z.number().optional()
  }).optional()
});

// Chat message schema
export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(4000).trim()
});

// File validation schema
export const FileUploadSchema = z.object({
  fileBase64: z.string().min(1),
  documentType: z.string().min(1).max(100).optional(),
  fileName: z.string().min(1).max(255).optional()
});

export type ApplicationData = z.infer<typeof ApplicationSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;