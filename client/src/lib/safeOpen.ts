export function safeOpen(url: string, target: '_blank'|'_self'|'_parent'|'_top' = '_blank') {
  const w = window.open(url, target, 'noopener,noreferrer');
  if (w) try { w.opener = null; } catch {}
  return w;
}