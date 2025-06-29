// scripts/clientDiagnosticSuite.ts
export const runTests = async () => {
  const base = process.env.VITE_API_BASE_URL || 'https://staffportal.replit.app/api';

  const results = {
    health: await test(`${base}/health`),
    login: await test(`${base}/auth/login`, 'POST'),
    register: await test(`${base}/auth/register`, 'POST'),
    reset: await test(`${base}/auth/request-reset`, 'POST')
  };

  return {
    timestamp: new Date().toISOString(),
    baseUrl: base,
    status: Object.values(results).every(r => r.success) ? "✅ PASSED" : "❌ FAILED",
    results,
    summary: {
      passed: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length,
      total: Object.values(results).length
    }
  };
};

const test = async (url: string, method: string = 'OPTIONS') => {
  try {
    const res = await fetch(url, { 
      method, 
      mode: "cors",
      credentials: "include",
      headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {}
    });
    
    const contentType = res.headers.get("content-type");
    const corsOrigin = res.headers.get("access-control-allow-origin");
    
    return {
      url,
      method,
      status: res.status,
      success: (res.ok || res.status === 401) && (contentType?.includes("application/json") || method === 'OPTIONS'),
      contentType,
      corsOrigin,
      timing: Date.now()
    };
  } catch (e: any) {
    return { 
      url, 
      method,
      success: false, 
      error: e.message,
      timing: Date.now()
    };
  }
};