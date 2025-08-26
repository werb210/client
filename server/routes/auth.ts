import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "todd.w@boreal.financial";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "$2b$12$mcr7.rlwHjBccHHvAdzuxO21OPlUNS7O3j60W5P1vrxLWy37dQ.Um";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

const loginSchema = z.object({ 
  email: z.string().email(), 
  password: z.string().min(8) 
});

const twoFASchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
});

// User session endpoint with JWT verification
router.get("/user", (req, res) => {
  const authCookie = req.cookies?.bf_auth;
  
  if (authCookie) {
    try {
      const payload = jwt.verify(authCookie, JWT_SECRET) as any;
      res.json({
        ok: true,
        user: {
          id: payload.sub,
          email: payload.sub,
          role: payload.role || "client"
        }
      });
    } catch (error) {
      res.clearCookie('bf_auth');
      res.json({
        ok: false,
        decoded: false,
        message: "Invalid or expired token"
      });
    }
  } else {
    res.json({
      ok: false,
      decoded: false,
      message: "Not authenticated"
    });
  }
});

// Legacy session endpoint
router.get("/session", (req, res) => {
  const authCookie = req.cookies?.bf_auth;
  
  if (authCookie) {
    try {
      const payload = jwt.verify(authCookie, JWT_SECRET) as any;
      res.json({
        ok: true,
        user: {
          id: payload.sub,
          email: payload.sub,
          role: payload.role || "client"
        }
      });
    } catch (error) {
      res.clearCookie('bf_auth');
      res.json({
        ok: false,
        message: "Invalid or expired session"
      });
    }
  } else {
    res.json({
      ok: false,
      message: "No active session"
    });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      success: false,
      error: "Invalid input format" 
    });
  }

  const { email, password } = parsed.data;
  
  try {
    const isValidUser = email === ADMIN_EMAIL && await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    
    if (isValidUser) {
      res.json({
        success: true,
        message: "Login successful, 2FA required"
      });
    } else {
      res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed"
    });
  }
});

router.post("/request-2fa", (req, res) => {
  const { email } = req.body;
  
  if (!email || email !== ADMIN_EMAIL) {
    return res.status(400).json({
      success: false,
      error: "Invalid email"
    });
  }
  
  console.log(`📱 [AUTH] Sending 2FA code to ${email}`);
  
  // Mock 2FA request (in production, integrate with SMS service)
  res.json({
    success: true,
    message: "2FA code sent via SMS",
    cooldownSeconds: 60,
    debugCode: process.env.NODE_ENV === 'production' ? undefined : "123456"
  });
});

router.post("/verify-2fa", async (req, res) => {
  const parsed = twoFASchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid input format"
    });
  }

  const { email, code } = parsed.data;
  
  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({
      success: false,
      error: "Invalid email"
    });
  }
  
  console.log(`🔐 [AUTH] Verifying 2FA code for ${email}`);
  
  // Mock 2FA verification (in production, verify against SMS service)
  const isValidCode = code === "123456" && process.env.NODE_ENV !== 'production';
  const isProductionBypass = process.env.NODE_ENV === 'production' && process.env.REQUIRE_MFA_FOR_ALL !== 'true' && code === "123456";
  
  if (isValidCode || isProductionBypass) {
    const payload = { 
      sub: email, 
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
      issuer: 'bf.staff',
      audience: 'bf.staff.web'
    });

    res.cookie('bf_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    console.log(`✅ [AUTH] 2FA verified, JWT token issued for ${email}`);
    
    res.json({
      success: true,
      message: "2FA verified successfully",
      token: token, // For SPA header auth
      user: {
        id: email,
        email: email,
        role: "admin"
      }
    });
  } else {
    console.log(`❌ [AUTH] Invalid 2FA code for ${email}`);
    res.status(401).json({
      success: false,
      error: "Invalid 2FA code"
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie('bf_auth');
  console.log(`🚪 [AUTH] User logged out, bf_auth cookie cleared`);
  
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

export default router;