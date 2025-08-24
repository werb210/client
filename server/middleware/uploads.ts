// server/middleware/uploads.ts - Secure file upload validation
import type { Request, Response, NextFunction } from "express";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png', 
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

declare global {
  namespace Express {
    interface Request {
      fileMime?: string;
      fileBytes?: number;
      fileBuffer?: Buffer;
    }
  }
}

export async function validateFileUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const fileBase64 = req.body?.fileBase64 as string;
    
    if (!fileBase64) {
      return res.status(400).json({ 
        ok: false, 
        error: "No file provided" 
      });
    }
    
    // Extract base64 data (remove data URL prefix if present)
    const base64Data = fileBase64.includes(',') 
      ? fileBase64.split(',')[1] 
      : fileBase64;
    
    if (!base64Data) {
      return res.status(400).json({ 
        ok: false, 
        error: "Invalid file format" 
      });
    }
    
    // Convert to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    if (buffer.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        error: "Empty file" 
      });
    }
    
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(413).json({ 
        ok: false, 
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      });
    }
    
    // Basic MIME type detection from file extension or header
    const mimeType = detectMimeType(buffer, req.body?.fileName);
    
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.status(415).json({ 
        ok: false, 
        error: `Unsupported file type: ${mimeType}`,
        allowed: Array.from(ALLOWED_MIME_TYPES)
      });
    }
    
    // Attach file info to request for downstream processing
    req.fileMime = mimeType;
    req.fileBytes = buffer.length;
    req.fileBuffer = buffer;
    
    next();
  } catch (error) {
    console.error('[FILE UPLOAD ERROR]:', error);
    res.status(400).json({ 
      ok: false, 
      error: "File processing failed" 
    });
  }
}

function detectMimeType(buffer: Buffer, fileName?: string): string {
  // PDF signature
  if (buffer.slice(0, 4).toString() === '%PDF') {
    return 'application/pdf';
  }
  
  // PNG signature
  if (buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
    return 'image/png';
  }
  
  // JPEG signature
  if (buffer.slice(0, 2).equals(Buffer.from([0xFF, 0xD8]))) {
    return 'image/jpeg';
  }
  
  // Fallback to file extension if provided
  if (fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
  }
  
  return 'application/octet-stream';
}