// server/routes/secure.ts - Secure API routes with validation and proxying
import type { Express, Request, Response } from "express";
import { session } from "../middleware/session";
import { ApplicationSchema, ChatMessageSchema, FileUploadSchema } from "../middleware/validation";
import { validateFileUpload } from "../middleware/uploads";
import cfg from "../config";

const STAFF_API_BASE = cfg.staffApiUrl.replace('/api/lender-products', '');
const CLIENT_TOKEN = cfg.clientToken;

export function setupSecureRoutes(app: Express) {
  // Apply session middleware to all routes
  app.use(session);
  
  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      ok: true, 
      service: 'client-portal',
      timestamp: new Date().toISOString(),
      sessionId: req.sessionId?.slice(0, 8) + '...' // Partial session ID for debugging
    });
  });
  
  // Secure application submission endpoint
  app.post('/api/public/applications', async (req: Request, res: Response) => {
    try {
      // Validate input with Zod
      const parseResult = ApplicationSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(422).json({
          ok: false,
          error: 'Invalid application data',
          issues: parseResult.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      
      console.log('📝 [SECURE] Forwarding validated application to Staff API');
      console.log('📦 [SECURE] Session:', req.sessionId?.slice(0, 8) + '...');
      
      // Forward to Staff API with server-side credentials
      const response = await fetch(`${STAFF_API_BASE}/public/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': CLIENT_TOKEN ? `Bearer ${CLIENT_TOKEN}` : '',
          'X-Client-Session': req.sessionId || '',
          'User-Agent': 'Boreal-Client-Portal/1.0'
        },
        body: JSON.stringify(parseResult.data)
      });
      
      const responseData = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
      
      if (response.ok) {
        console.log('✅ [SECURE] Application forwarded successfully');
      } else {
        console.log('❌ [SECURE] Staff API error:', response.status, responseData);
      }
      
      return res.status(response.status).json(responseData);
      
    } catch (error) {
      console.error('❌ [SECURE] Application submission failed:', error);
      return res.status(503).json({
        ok: false,
        error: 'Service temporarily unavailable',
        message: 'Unable to process application submission'
      });
    }
  });
  
  // Secure chat endpoint
  app.post('/api/chat/message', async (req: Request, res: Response) => {
    try {
      const parseResult = ChatMessageSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(422).json({
          ok: false,
          error: 'Invalid message format',
          issues: parseResult.error.issues
        });
      }
      
      // Forward to Staff API chat endpoint
      const response = await fetch(`${STAFF_API_BASE}/api/chat/user-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': CLIENT_TOKEN ? `Bearer ${CLIENT_TOKEN}` : '',
          'X-Client-Session': req.sessionId || ''
        },
        body: JSON.stringify({
          message: parseResult.data.message,
          sessionId: req.sessionId
        })
      });
      
      const data = await response.json().catch(() => ({}));
      return res.status(response.status).json(data);
      
    } catch (error) {
      console.error('❌ [SECURE] Chat message failed:', error);
      return res.status(503).json({
        ok: false,
        error: 'Chat service unavailable'
      });
    }
  });
  
  // Secure file upload validation endpoint
  app.post('/api/uploads/validate', validateFileUpload, (req: Request, res: Response) => {
    res.json({
      ok: true,
      mime: req.fileMime,
      size: req.fileBytes,
      sessionId: req.sessionId?.slice(0, 8) + '...'
    });
  });
  
  // Lender products endpoint (with caching)
  app.get('/api/public/lenders', async (req: Request, res: Response) => {
    try {
      console.log('📡 [SECURE] Fetching lender products from Staff API');
      
      const queryString = new URLSearchParams(req.query as any).toString();
      const staffUrl = `${STAFF_API_BASE}/api/lender-products${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(staffUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': CLIENT_TOKEN ? `Bearer ${CLIENT_TOKEN}` : ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [SECURE] Lender products retrieved successfully');
        
        // Add cache headers for performance
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
        res.json(data);
      } else {
        const errorText = await response.text();
        console.error('❌ [SECURE] Staff API lender error:', response.status, errorText);
        res.status(response.status).json({
          ok: false,
          error: 'Unable to fetch lender products',
          status: response.status
        });
      }
    } catch (error) {
      console.error('❌ [SECURE] Lender products request failed:', error);
      res.status(503).json({
        ok: false,
        error: 'Lender service temporarily unavailable'
      });
    }
  });
}