// server/middleware/uploads-enhanced.ts - Enhanced file upload security
import type { Request, Response, NextFunction } from "express";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (reduced from 25MB)
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png', 
  'image/jpeg'
  // Removed DOC/DOCX for enhanced security
]);

const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'png', 'jpg', 'jpeg'
]);

// File signatures for magic byte validation
const FILE_SIGNATURES = {
  'pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'jpg': [0xFF, 0xD8, 0xFF],
  'jpeg': [0xFF, 0xD8, 0xFF]
};

declare global {
  namespace Express {
    interface Request {
      fileMime?: string;
      fileBytes?: number;
      fileBuffer?: Buffer;
      fileValidated?: boolean;
    }
  }
}

export async function validateFileUploadEnhanced(req: Request, res: Response, next: NextFunction) {
  try {
    const { fileBase64, fileName } = req.body;
    
    if (!fileBase64) {
      return res.status(400).json({ 
        ok: false, 
        error: "No file provided",
        code: "MISSING_FILE"
      });
    }
    
    if (!fileName) {
      return res.status(400).json({
        ok: false,
        error: "File name required for security validation",
        code: "MISSING_FILENAME" 
      });
    }
    
    // Extract file extension
    const extension = fileName.toLowerCase().split('.').pop();
    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      return res.status(415).json({
        ok: false,
        error: `File extension not allowed: .${extension}`,
        allowed: Array.from(ALLOWED_EXTENSIONS),
        code: "INVALID_EXTENSION"
      });
    }
    
    // Extract base64 data
    const base64Data = fileBase64.includes(',') 
      ? fileBase64.split(',')[1] 
      : fileBase64;
    
    if (!base64Data) {
      return res.status(400).json({ 
        ok: false, 
        error: "Invalid base64 format",
        code: "INVALID_BASE64"
      });
    }
    
    // Convert to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    if (buffer.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        error: "Empty file not allowed",
        code: "EMPTY_FILE"
      });
    }
    
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(413).json({ 
        ok: false, 
        error: `File too large. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        code: "FILE_TOO_LARGE"
      });
    }
    
    // Magic byte validation
    const detectedType = detectFileTypeByMagicBytes(buffer);
    if (!detectedType) {
      return res.status(415).json({
        ok: false,
        error: "File type could not be determined from content",
        code: "UNRECOGNIZED_FILE_TYPE"
      });
    }
    
    // Verify extension matches detected type
    if (!extensionMatchesType(extension, detectedType)) {
      return res.status(415).json({
        ok: false,
        error: `File extension .${extension} does not match detected type: ${detectedType}`,
        code: "EXTENSION_MISMATCH"
      });
    }
    
    const mimeType = typeToMime(detectedType);
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.status(415).json({ 
        ok: false, 
        error: `File type not allowed: ${mimeType}`,
        allowed: Array.from(ALLOWED_MIME_TYPES),
        code: "MIME_NOT_ALLOWED"
      });
    }
    
    // All validations passed
    req.fileMime = mimeType;
    req.fileBytes = buffer.length;
    req.fileBuffer = buffer;
    req.fileValidated = true;
    
    console.log(`[UPLOAD] ✅ File validated: ${fileName} (${mimeType}, ${buffer.length} bytes)`);
    next();
    
  } catch (error) {
    console.error('[UPLOAD] ❌ Validation error:', error);
    res.status(400).json({ 
      ok: false, 
      error: "File validation failed",
      code: "VALIDATION_ERROR"
    });
  }
}

function detectFileTypeByMagicBytes(buffer: Buffer): string | null {
  for (const [type, signature] of Object.entries(FILE_SIGNATURES)) {
    if (buffer.length >= signature.length) {
      const matches = signature.every((byte, index) => buffer[index] === byte);
      if (matches) return type;
    }
  }
  return null;
}

function extensionMatchesType(extension: string, detectedType: string): boolean {
  const matches: Record<string, string[]> = {
    'pdf': ['pdf'],
    'png': ['png'],
    'jpg': ['jpg', 'jpeg'],
    'jpeg': ['jpg', 'jpeg']
  };
  
  return matches[detectedType]?.includes(extension) || false;
}

function typeToMime(type: string): string {
  const mimeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };
  
  return mimeMap[type] || 'application/octet-stream';
}