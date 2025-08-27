import DOMPurify from "dompurify";
import React from "react";

export function setSafeHtml(el: HTMLElement | null, html: string) {
  if (!el) return;
  el.innerHTML = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

export function SafeHtml({ html }: { html: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => setSafeHtml(ref.current, html), [html]);
  return <div ref={ref} />;
}