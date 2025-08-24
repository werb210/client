// server/routes/hardened.ts - Final hardened security routes
import type { Express, Request, Response } from "express";
import { session } from "../middleware/session";
import { issueCsrf, requireCsrf } from "../security/csrf";
import { ApplicationSchema, ChatMessageSchema } from "../middleware/validation";
import { validateFileUploadEnhanced } from "../middleware/uploads-enhanced";
import { secureLogger } from "../middleware/logging";
import cfg from "../config";

const STAFF_API_BASE = cfg.staffApiUrl.replace('/api/lender-products', '');
const CLIENT_TOKEN = cfg.clientToken;

export function setupHardenedRoutes(app: Express) {
  // Apply security middleware stack
  app.use(secureLogger);
  app.use(session);
  app.use(issueCsrf); // Issue CSRF tokens on all requests
  
  // CSP violation reporting endpoint
  app.post('/csp-report', (req: Request, res: Response) => {
    console.warn('[CSP VIOLATION]', {
      report: req.body,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: req.sessionId?.substring(0, 8) + '...'
    });
    res.status(204).send();
  });
  
  // Health check (no CSRF required for GET)
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      ok: true, 
      service: 'boreal-client-portal',
      timestamp: new Date().toISOString(),
      sessionId: req.sessionId?.slice(0, 8) + '...',
      csrfToken: req.csrfToken?.slice(0, 8) + '...'
    });
  });
  
  // Protected application submission (requires CSRF)
  app.post('/api/public/applications', requireCsrf, async (req: Request, res: Response) => {
    try {
      const parseResult = ApplicationSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        console.warn('[VALIDATION] Application data rejected:', {
          sessionId: req.sessionId?.slice(0, 8) + '...',
          errors: parseResult.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
        });
        
        return res.status(422).json({
          ok: false,
          error: 'Invalid application data',
          code: 'VALIDATION_FAILED',
          issues: parseResult.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      
      console.log('[SECURE] 📝 Forwarding validated application to Staff API');
      
      const response = await fetch(`${STAFF_API_BASE}/public/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': CLIENT_TOKEN ? `Bearer ${CLIENT_TOKEN}` : '',
          'X-Client-Session': req.sessionId || '',
          'X-Client-IP': req.ip || '',
          'User-Agent': 'Boreal-Client-Portal/2.0-Secure'
        },
        body: JSON.stringify(parseResult.data)
      });
      
      const responseData = await response.json().catch(() => ({ 
        error: 'Invalid JSON response from staff API' 
      }));
      
      if (response.ok) {
        console.log('[SECURE] ✅ Application forwarded successfully');
        
        // Log successful submission for security audit
        console.log('[AUDIT] Application submitted:', {
          sessionId: req.sessionId?.slice(0, 8) + '...',
          ip: req.ip,
          timestamp: new Date().toISOString(),
          hasStep1: !!parseResult.data.step1,
          hasStep3: !!parseResult.data.step3,
          hasStep4: !!parseResult.data.step4
        });
      } else {
        console.warn('[SECURE] ❌ Staff API error:', response.status);
      }
      
      return res.status(response.status).json(responseData);
      
    } catch (error) {
      console.error('[SECURE] ❌ Application submission failed:', error);
      return res.status(503).json({
        ok: false,
        error: 'Service temporarily unavailable',
        code: 'SERVICE_ERROR'
      });
    }
  });
  
  // Protected chat endpoint (requires CSRF)
  app.post('/api/chat/message', requireCsrf, async (req: Request, res: Response) => {
    try {
      const parseResult = ChatMessageSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(422).json({
          ok: false,
          error: 'Invalid message format',
          code: 'VALIDATION_FAILED'
        });
      }
      
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
      console.error('[SECURE] ❌ Chat message failed:', error);
      return res.status(503).json({
        ok: false,
        error: 'Chat service unavailable',
        code: 'SERVICE_ERROR'
      });
    }
  });
  
  // Enhanced file upload validation (requires CSRF)
  app.post('/api/uploads/validate', requireCsrf, validateFileUploadEnhanced, (req: Request, res: Response) => {
    console.log('[AUDIT] File upload validated:', {
      sessionId: req.sessionId?.slice(0, 8) + '...',
      mime: req.fileMime,
      size: req.fileBytes,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      ok: true,
      mime: req.fileMime,
      size: req.fileBytes,
      validated: req.fileValidated,
      sessionId: req.sessionId?.slice(0, 8) + '...'
    });
  });
  
  // Lender products (cached, no CSRF needed for GET)
  app.get('/api/public/lenders', async (req: Request, res: Response) => {
    try {
      const queryString = new URLSearchParams(req.query as any).toString();
      const staffUrl = `${STAFF_API_BASE}/api/lender-products${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(staffUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': CLIENT_TOKEN ? `Bearer ${CLIENT_TOKEN}` : '',
          'X-Client-Session': req.sessionId || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        res.set({
          'Cache-Control': 'public, max-age=300',
          'ETag': `"${Date.now()}"`
        });
        
        res.json(data);
      } else {
        res.status(response.status).json({
          ok: false,
          error: 'Unable to fetch lender products',
          code: 'STAFF_API_ERROR'
        });
      }
    } catch (error) {
      console.error('[SECURE] ❌ Lender products request failed:', error);
      res.status(503).json({
        ok: false,
        error: 'Lender service temporarily unavailable',
        code: 'SERVICE_ERROR'
      });
    }
  });
}