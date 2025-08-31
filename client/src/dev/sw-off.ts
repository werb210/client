export async function disableSWInDev() {
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      regs.forEach(r => r.unregister());
      console.info('[DEV] Service worker disabled.');
    } catch (e) {
      console.warn('[DEV] SW disable attempt failed:', e);
    }
  }
}