// server/app.ts - Clean Express app with proper error handling
import express, { Request, Response, NextFunction } from "express";
import path from "node:path";
import cookieParser from "cookie-parser";

export const app = express();

// JSON + form parsing with size limits
app.use(express.json({ 
  limit: "5mb", 
  type: ["application/json", "application/*+json"] 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: "5mb" 
}));
app.use(cookieParser());

// Serve static files from dist (built client)
app.use(express.static(path.join(process.cwd(), "dist")));

// Central error handler - no stack leaks in production
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const message = err instanceof Error ? err.message : "Internal server error";
  const stack = isDev && err instanceof Error ? err.stack : undefined;
  
  console.error('[SERVER ERROR]:', err);
  
  res.status(500).json({ 
    ok: false, 
    error: message,
    ...(stack && { stack })
  });
});