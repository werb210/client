export function setupDevServiceWorkerGuard() {
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach(r => r.unregister().catch(() => {}));
      // Also nuke caches from older SWs
      // @ts-ignore
      if (window.caches?.keys) {
        // not awaited—best-effort cleanup
        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      }
      console.info("[SW] Disabled in development");
    });
  }
}

export function unregisterServiceWorker(){if('serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister())).catch(()=>{});}}