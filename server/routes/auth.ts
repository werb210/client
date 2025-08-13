import { Router } from "express";

const router = Router();

// User session endpoint with cookie support
router.get("/user", (req, res) => {
  // Check for bf_auth cookie or session
  const authCookie = req.cookies?.bf_auth;
  
  if (authCookie) {
    // Return authenticated user
    res.json({
      ok: true,
      user: {
        id: "test-user-1",
        email: "todd.w@boreal.financial",
        role: "client"
      }
    });
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
    res.json({
      ok: true,
      user: {
        id: "test-user-1",
        email: "todd.w@boreal.financial",
        role: "client"
      }
    });
  } else {
    res.json({
      ok: false,
      message: "No active session"
    });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  // Mock login validation
  if (email === "todd.w@boreal.financial" && password === "admin123") {
    res.json({
      success: true,
      message: "Login successful, 2FA required"
    });
  } else {
    res.status(400).json({
      success: false,
      error: "Invalid email or password"
    });
  }
});

router.post("/request-2fa", (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email required"
    });
  }
  
  console.log(`📱 [AUTH] Sending 2FA code to ${email}`);
  
  // Mock 2FA request
  res.json({
    success: true,
    message: "2FA code sent via SMS",
    cooldownSeconds: 60,
    debugCode: "123456" // For testing
  });
});

router.post("/verify-2fa", (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({
      success: false,
      error: "Email and code required"
    });
  }
  
  console.log(`🔐 [AUTH] Verifying 2FA code ${code} for ${email}`);
  
  // Mock 2FA verification
  if (code === "123456") {
    // Set authentication cookie
    res.cookie('bf_auth', 'authenticated_session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    console.log(`✅ [AUTH] 2FA verified, setting bf_auth cookie for ${email}`);
    
    res.json({
      success: true,
      message: "2FA verified successfully",
      user: {
        id: "test-user-1",
        email: email,
        role: "client"
      }
    });
  } else {
    console.log(`❌ [AUTH] Invalid 2FA code ${code} for ${email}`);
    res.status(400).json({
      success: false,
      error: "Invalid 2FA code"
    });
  }
});

router.post("/logout", (req, res) => {
  // Clear authentication cookie
  res.clearCookie('bf_auth');
  console.log(`🚪 [AUTH] User logged out, bf_auth cookie cleared`);
  
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

export default router;