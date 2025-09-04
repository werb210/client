export function installSubmitInterceptor() {
  const _fetch = window.fetch;
  window.fetch = async (url: any, opts: any) => {
    if (typeof url === 'string' && /\/api\/applications$/.test(url) && opts?.method === 'POST') {
      try {
        const body = JSON.parse(opts.body || '{}');
        const canon = JSON.parse(body.application_canon || '{}');
        console.log('🚀 SUBMIT BODY KEYS:', Object.keys(body).length, Object.keys(body));
        console.log('🚀 CANON KEYS:', Object.keys(canon).length, Object.keys(canon));
      } catch(e) { 
        console.warn('inspect error', e); 
      }
    }
    return _fetch(url, opts);
  };
  console.log('✅ submit interceptor installed');
}