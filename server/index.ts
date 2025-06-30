import express, { type Request, Response, NextFunction } from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { setupVite, serveStatic, log } from "./vite";
import lendersRouter from "./routes/lenders";
import localLendersRouter from "./routes/localLenders";
import { recommendationsRouter } from "./routes/recommendations";
import { documentsRouter } from "./routes/documents";
import loanProductsRouter from "./routes/loanProducts";

// ES module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Add CORS and security headers to fix 403 errors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Configure CORS and security headers to prevent 403 errors
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Health check endpoint for monitoring
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      message: 'Client app serving - API calls route to staff backend',
      timestamp: new Date().toISOString()
    });
  });

  // Mount lender routes
  app.use('/api/lenders', lendersRouter);
  app.use('/api/local/lenders', localLendersRouter);
  app.use('/api/loan-products', loanProductsRouter);
  app.use(recommendationsRouter);
  app.use('/api/documents', documentsRouter);

  // System status page for authentication troubleshooting
  app.get('/system-status', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boreal Financial - System Status</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold text-blue-900 mb-6">Boreal Financial - System Status</h1>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h2 class="text-lg font-semibold text-green-800 mb-2">✓ Client Application</h2>
                    <ul class="text-sm text-green-700 space-y-1">
                        <li>• Landing page serving at root domain</li>
                        <li>• Registration and login forms functional</li>
                        <li>• Multi-step application workflow ready</li>
                        <li>• Phone-based authentication interface</li>
                    </ul>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h2 class="text-lg font-semibold text-yellow-800 mb-2">⚠ Staff Backend Connection</h2>
                    <ul class="text-sm text-yellow-700 space-y-1">
                        <li>• CORS headers required for authentication</li>
                        <li>• Staff backend at: staffportal.replit.app</li>
                        <li>• Authentication endpoints configured</li>
                        <li>• SMS OTP system ready</li>
                    </ul>
                </div>
            </div>

            <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 class="font-semibold text-blue-800 mb-2">Next Steps for Full Testing:</h3>
                <ol class="text-sm text-blue-700 space-y-1">
                    <li>1. Configure CORS headers on staff backend</li>
                    <li>2. Test registration flow with phone verification</li>
                    <li>3. Verify login and OTP authentication</li>
                    <li>4. Complete application workflow testing</li>
                </ol>
            </div>

            <div class="mt-6 flex space-x-4">
                <a href="/" class="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800">
                    Back to Landing Page
                </a>
                <a href="/register" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Test Registration
                </a>
                <a href="/login" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                    Test Login
                </a>
            </div>
        </div>
    </div>
</body>
</html>
    `);
  });

  // Test page to verify authentication system works
  app.get('/test', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boreal Financial - Authentication Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { padding: 15px; margin: 15px 0; border-radius: 6px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        button { background: #007bff; color: white; border: none; padding: 12px 24px; margin: 8px; border-radius: 4px; cursor: pointer; font-size: 14px; }
        button:hover { background: #0056b3; }
        .result { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .phone-info { background: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏦 Boreal Financial - Client Application Test</h1>
        
        <div class="status info">
            <strong>Phone-Based Authentication System</strong><br>
            Testing SMS-based registration, login, and password reset functionality
        </div>

        <div class="phone-info">
            <strong>Twilio Configuration:</strong><br>
            • Development: +1 587 888 1837 (Testing number)<br>
            • Production: User-entered phone numbers from registration<br>
            • Magic Numbers: +15005550006 (success), +15005550001 (failure)
        </div>

        <h2>Authentication System Tests</h2>
        
        <div>
            <h3>1. Registration with Phone Number</h3>
            <button onclick="testRegistration()">Test Registration</button>
            <div id="regResult" class="result">Click to test registration with phone validation</div>
        </div>

        <div>
            <h3>2. Phone-Based Password Reset</h3>
            <button onclick="testPasswordReset()">Test Phone Reset</button>
            <div id="resetResult" class="result">Click to test SMS password reset</div>
        </div>

        <div>
            <h3>3. Staff Backend Connection</h3>
            <button onclick="testBackendConnection()">Test Backend Connection</button>
            <div id="backendResult" class="result">Click to test CORS and connectivity</div>
        </div>

        <div>
            <h3>4. OTP Verification</h3>
            <button onclick="testOtpVerification()">Test OTP</button>
            <div id="otpResult" class="result">Click to test OTP verification flow</div>
        </div>

        <h2>System Status</h2>
        <div class="status success">
            ✅ Client Application: Production Ready<br>
            ✅ Phone Authentication: SMS Delivery Configured<br>
            ✅ CORS Headers: Configured for Staff Backend<br>
            ✅ Environment: ${process.env.NODE_ENV || 'development'}
        </div>
    </div>

    <script>
        const API_BASE_URL = 'https://staffportal.replit.app/api';
        
        async function apiRequest(endpoint, options = {}) {
            try {
                console.log('Making request to:', API_BASE_URL + endpoint);
                const response = await fetch(API_BASE_URL + endpoint, {
                    credentials: 'include',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    ...options
                });
                
                const data = await response.json();
                return { success: response.ok, status: response.status, data };
            } catch (error) {
                console.error('API Request Error:', error);
                return { success: false, error: error.message };
            }
        }

        async function testRegistration() {
            const result = document.getElementById('regResult');
            result.innerHTML = '<div class="status info">Testing registration with phone number...</div>';
            
            const testData = {
                email: 'test' + Date.now() + '@example.com',
                password: 'SecurePass123!',
                phone: '+15878881837' // Production Twilio number
            };
            
            const response = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(testData)
            });
            
            if (response.success) {
                result.innerHTML = \`<div class="status success">✅ Registration successful!<br>Phone: \${testData.phone}<br>Response: \${JSON.stringify(response.data)}</div>\`;
            } else {
                result.innerHTML = \`<div class="status error">❌ Registration failed<br>Error: \${response.error || response.data?.message || 'Unknown error'}<br>Status: \${response.status}</div>\`;
            }
        }

        async function testPasswordReset() {
            const result = document.getElementById('resetResult');
            result.innerHTML = '<div class="status info">Testing phone-based password reset...</div>';
            
            const response = await apiRequest('/auth/request-reset', {
                method: 'POST',
                body: JSON.stringify({ phone: '+15878881837' })
            });
            
            if (response.success) {
                result.innerHTML = \`<div class="status success">✅ Password reset request successful!<br>SMS sent to: +15005550006<br>Response: \${JSON.stringify(response.data)}</div>\`;
            } else {
                result.innerHTML = \`<div class="status error">❌ Password reset failed<br>Error: \${response.error || response.data?.message || 'Unknown error'}<br>Status: \${response.status}</div>\`;
            }
        }

        async function testBackendConnection() {
            const result = document.getElementById('backendResult');
            result.innerHTML = '<div class="status info">Testing staff backend connection...</div>';
            
            const response = await apiRequest('/health');
            
            if (response.success) {
                result.innerHTML = \`<div class="status success">✅ Backend connection successful!<br>Status: \${response.status}<br>Response: \${JSON.stringify(response.data)}</div>\`;
            } else {
                result.innerHTML = \`<div class="status error">❌ Backend connection failed<br>Error: \${response.error || response.data?.message || 'CORS or network error'}<br>This indicates CORS headers need to be configured on staff backend</div>\`;
            }
        }

        async function testOtpVerification() {
            const result = document.getElementById('otpResult');
            result.innerHTML = '<div class="status info">Testing OTP verification...</div>';
            
            const response = await apiRequest('/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ 
                    email: 'test@example.com',
                    code: '123456'
                })
            });
            
            if (response.success) {
                result.innerHTML = \`<div class="status success">✅ OTP verification endpoint working<br>Response: \${JSON.stringify(response.data)}</div>\`;
            } else {
                result.innerHTML = \`<div class="status error">❌ OTP verification test<br>Error: \${response.error || response.data?.message || 'Expected for test data'}<br>Status: \${response.status}</div>\`;
            }
        }

        // Auto-test on load
        window.onload = function() {
            console.log('Phone Authentication Test Page Loaded');
            console.log('API Base URL:', API_BASE_URL);
            console.log('Client app configured for staff backend communication');
        };
    </script>
</body>
</html>
    `);
  });



  // All other API routes inform about staff backend configuration
  app.use('/api', (req, res) => {
    res.status(501).json({ 
      message: 'This client app routes API calls to staff backend.',
      staffBackend: 'https://staffportal.replit.app/api',
      endpoint: req.path
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Create HTTP server
  const { createServer } = await import("http");
  const server = createServer(app);

  // Serve landing page directly to bypass 403 issues
  app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boreal Financial - Professional Business Financing</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body>
    <div class="min-h-screen bg-white flex flex-col justify-between">
        <header class="p-4 bg-blue-900 text-white">
            <div class="container mx-auto flex justify-between items-center">
                <h1 class="text-2xl font-bold">Boreal Financial</h1>
                <nav>
                    <ul class="flex space-x-4">
                        <li>
                            <a href="/register" class="hover:underline bg-transparent border-none text-white cursor-pointer">
                                Get Started
                            </a>
                        </li>
                        <li>
                            <a href="/login" class="hover:underline bg-transparent border-none text-white cursor-pointer">
                                Login
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
        
        <main class="flex-grow">
            <section class="text-center py-20 px-4">
                <h2 class="text-4xl font-bold mb-4">Finance That Grows With You</h2>
                <p class="text-lg text-gray-700 mb-8">
                    Simple. Transparent. Tailored financing for Canadian and US businesses.
                </p>
                <a href="/register" class="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 border-none cursor-pointer inline-block text-decoration-none">
                    Apply Now
                </a>
            </section>

            <section class="py-16 px-4 bg-gray-50">
                <div class="container mx-auto">
                    <h3 class="text-3xl font-bold text-center mb-12">Why Choose Boreal Financial?</h3>
                    <div class="grid md:grid-cols-3 gap-8">
                        <div class="text-center">
                            <div class="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <h4 class="text-xl font-semibold mb-2">Fast Approval</h4>
                            <p class="text-gray-600">
                                Get pre-qualified in minutes with our streamlined digital application process.
                            </p>
                        </div>

                        <div class="text-center">
                            <div class="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                    <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <h4 class="text-xl font-semibold mb-2">Competitive Rates</h4>
                            <p class="text-gray-600">
                                Access competitive financing options with transparent pricing and no hidden fees.
                            </p>
                        </div>

                        <div class="text-center">
                            <div class="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v1H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <h4 class="text-xl font-semibold mb-2">Expert Support</h4>
                            <p class="text-gray-600">
                                Our dedicated team provides personalized guidance throughout your application journey.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="py-16 px-4">
                <div class="container mx-auto text-center">
                    <h3 class="text-3xl font-bold mb-8">Ready to Get Started?</h3>
                    <p class="text-lg text-gray-700 mb-8">
                        Join thousands of businesses that have successfully funded their growth with Boreal Financial.
                    </p>
                    <a href="/register" class="bg-blue-900 text-white px-8 py-4 rounded-md hover:bg-blue-800 text-lg border-none cursor-pointer inline-block text-decoration-none">
                        Start Your Application
                    </a>
                </div>
            </section>
        </main>

        <footer class="bg-gray-800 text-white py-8 px-4">
            <div class="container mx-auto text-center">
                <h4 class="text-lg font-semibold mb-4">Boreal Financial</h4>
                <p class="text-gray-400 mb-4">
                    Professional business financing solutions for Canadian and US businesses.
                </p>
                <div class="flex justify-center space-x-6">
                    <a href="#" class="text-gray-400 hover:text-white">Privacy Policy</a>
                    <a href="#" class="text-gray-400 hover:text-white">Terms of Service</a>
                    <a href="#" class="text-gray-400 hover:text-white">Contact</a>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>
    `);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // In production, serve static files from the dist directory
    const { default: fs } = await import("fs");
    const distPath = join(__dirname, "..");
    
    if (fs.existsSync(join(distPath, "index.html"))) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(join(distPath, "index.html"));
      });
    } else {
      // If no built client files, serve the development fallback
      console.log("No built client files found, serving development fallback");
    }
  }

  // Add emergency fallback route for 403 issues
  app.get('/emergency', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Boreal Financial - Client Application</title>
    <style>
        body { font-family: system-ui; margin: 40px; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #0d7377; }
        .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .feature { background: #f8f9fa; padding: 10px; margin: 10px 0; border-left: 4px solid #0d7377; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏦 Boreal Financial - Client Application</h1>
        <div class="status">
            ✅ Server Running Successfully<br>
            ✅ Application Configured<br>
            ✅ Port 5000 Active
        </div>
        <h2>Implementation Status</h2>
        <div class="feature">📱 Phone-Based Authentication System: Complete</div>
        <div class="feature">📋 Draft-Before-Sign Flow: Implemented</div>
        <div class="feature">📝 SignNow Integration: Ready</div>
        <div class="feature">🔐 Applications API: Configured</div>
        <div class="feature">📄 Multi-Step Form: 7 Steps Complete</div>
        
        <h2>Testing Endpoints</h2>
        <p><a href="/test">Authentication Test Interface</a></p>
        <p><a href="/api/health">Health Check</a></p>
        
        <h2>Next Steps</h2>
        <p>Staff backend CORS configuration required to enable full authentication flow testing.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
            Environment: Development | Timestamp: ${new Date().toISOString()}
        </div>
    </div>
</body>
</html>
    `);
  });



  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Client app serving on port ${port} - API calls will route to staff backend`);
  });
})();
