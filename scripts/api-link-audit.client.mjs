import fs from "fs";
import http from "http";
import https from "https";

// Since our client uses relative paths that get proxied, we'll test both:
// 1. Direct to staff backend: https://staff.boreal.financial/api
// 2. Through our proxy: http://localhost:5000

const STAFF_BASE = "https://staff.boreal.financial/api";
const PROXY_BASE = "http://localhost:5000";

// Key endpoints found in our client codebase
const endpoints = [
  '/api/v1/products',
  '/api/lenders', 
  '/api/applications',
  '/api/applications/validate-intake',
  '/api/required-docs',
  '/api/uploads',
  '/api/public/applications/{id}/documents',
  '/api/public/upload/{id}',
  '/api/analytics/recommendation-log',
  '/api/s3-documents-new/document-url',
  '/api/public/signnow/initiate/{id}',
  '/api/chat/request-staff',
  '/api/crm/contacts/auto-create',
  '/api/ai/report-issue',
  '/api/chat/log-contact',
  '/api/vapid-public-key',
  '/api/notifications/test',
  '/api/health'
];

console.log(`Testing ${endpoints.length} key API endpoints found in client code`);

function simpleFetch(url, method="GET", headers={}, body=null) {
  return new Promise((resolve) => {
    try {
      const lib = url.startsWith("https") ? https : http;
      const u = new URL(url);
      const req = lib.request({
        method, hostname: u.hostname, port: u.port || (u.protocol==="https:"?443:80),
        path: u.pathname + (u.search||""), headers
      }, (res) => {
        let data=""; res.on("data", c => data += c);
        res.on("end", () => resolve({ok:true, status:res.statusCode, headers:res.headers, body:data.slice(0,1000)}));
      });
      req.on("error", (e) => resolve({ok:false, error:e.message}));
      if (body) req.write(body);
      req.end();
    } catch(e) {
      resolve({ok:false, error:String(e)});
    }
  });
}

const methodsToTry = (endpoint) => {
  if (endpoint.includes('upload') || endpoint.includes('applications') || endpoint.includes('chat')) return ["GET","POST"];
  if (endpoint.includes('validate-intake') || endpoint.includes('required-docs')) return ["POST"];
  return ["GET"];
};

const sampleJson = JSON.stringify({
  ping:"client-diagnostic", 
  time:new Date().toISOString(),
  category: "equipment_financing",
  country: "CA",
  amount: 100000
});

(async () => {
  const results = [];
  const bearerToken = process.env.VITE_CLIENT_APP_SHARED_TOKEN;
  
  for (const endpoint of endpoints) {
    // Replace {id} with test ID
    const testEndpoint = endpoint.replace(/{id}/g, 'test-12345');
    
    // Test both direct to staff and through proxy
    const urls = [
      `${STAFF_BASE}${testEndpoint}`,
      `${PROXY_BASE}${testEndpoint}`
    ];
    
    for (const url of urls) {
      for (const method of methodsToTry(endpoint)) {
        const headers = {
          "Accept":"application/json, */*",
          "Content-Type": "application/json",
        };
        
        // Add bearer token for staff API calls
        if (url.includes('staff.boreal.financial') && bearerToken) {
          headers["Authorization"] = `Bearer ${bearerToken}`;
        }
        
        let body = null;
        if (method==="POST") {
          body = sampleJson;
        }
        
        const r = await simpleFetch(url, method, headers, body);
        const h = (r.headers||{});
        
        // Parse response body for errors
        let errorType = null;
        let dataCount = null;
        if (r.body) {
          if (r.body.includes('invalid_token')) errorType = 'invalid_token';
          else if (r.body.includes('Failed to create application')) errorType = 'failed_application';
          else if (r.body.includes('Cannot POST')) errorType = 'endpoint_not_found';
          else if (r.body.includes('Cannot GET')) errorType = 'endpoint_not_found';
          else if (r.body.includes('healthy')) errorType = 'working';
          
          // Try to count array results
          try {
            const json = JSON.parse(r.body);
            if (Array.isArray(json)) {
              dataCount = json.length;
            }
          } catch (e) {
            // Not JSON
          }
        }
        
        results.push({
          source: url.includes('localhost') ? 'proxy' : 'staff',
          endpoint,
          testUrl: url,
          method,
          status: r.status ?? null,
          ok: !!r.ok && (r.status>=200 && r.status<600),
          error: r.error ?? null,
          errorType,
          dataCount,
          cors: {
            allowOrigin: h["access-control-allow-origin"] || null,
            allowMethods: h["access-control-allow-methods"] || null,
          },
          bodySnippet: r.body?.slice(0, 200) ?? null,
          time: new Date().toISOString()
        });
      }
    }
  }
  
  fs.writeFileSync("reports/client_api_probe.json", JSON.stringify(results, null, 2));
  console.log("✅ Wrote reports/client_api_probe.json with", results.length, "entries.");
})();