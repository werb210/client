import { Router } from "express";

const router = Router();

// Mock authentication for client testing
router.get("/session", (req, res) => {
  // Return mock user session for development
  res.json({
    ok: true,
    user: {
      id: "test-user-1",
      email: "test@example.com",
      role: "client"
    }
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  // Mock login validation
  if (email && password) {
    res.json({
      ok: true,
      message: "Login successful, MFA required"
    });
  } else {
    res.status(400).json({
      ok: false,
      error: "Email and password required"
    });
  }
});

router.post("/request-otp", (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      ok: false,
      error: "Email required"
    });
  }
  
  // Mock OTP request
  res.json({
    ok: true,
    message: "OTP sent",
    cooldownSeconds: 60,
    debugCode: "123456" // For testing
  });
});

router.post("/verify-otp", (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({
      ok: false,
      error: "Email and code required"
    });
  }
  
  // Mock OTP verification
  if (code === "123456") {
    res.json({
      ok: true,
      message: "OTP verified successfully"
    });
  } else {
    res.status(400).json({
      ok: false,
      error: "Invalid OTP code"
    });
  }
});

router.post("/logout", (req, res) => {
  res.json({
    ok: true,
    message: "Logged out successfully"
  });
});

export default router;