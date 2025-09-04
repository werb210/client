export function installSubmitInterceptor() {
  const _fetch = window.fetch;
  window.fetch = async (url: any, opts: any) => {
    if (typeof url === "string" && /\/api\/applications$/.test(url) && opts?.method === "POST") {
      try {
        if (opts.body instanceof FormData) {
          const keys = Array.from(opts.body.keys());
          console.log("📦 FormData keys ("+keys.length+"):", keys);
        } else if (typeof opts.body === 'string') {
          const body = JSON.parse(opts.body || '{}');
          console.log("📦 JSON body keys ("+Object.keys(body).length+"):", Object.keys(body));
        }
        
        const canonRaw = localStorage.getItem("bf:canon:v1") || "{}";
        const size = new Blob([canonRaw]).size;
        const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonRaw));
        const hash = Array.from(new Uint8Array(hashBuffer)).slice(0,8).map(b=>b.toString(16).padStart(2,"0")).join("");
        console.log(`🔎 Canon snapshot size=${size}B hash=${hash}`);
      } catch(e){ 
        console.warn("submitInterceptor error", e); 
      }
    }
    return _fetch(url, opts);
  };
  console.log("✅ submitInterceptor installed");
}