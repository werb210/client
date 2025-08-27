import DOMPurify from "dompurify";

export function sanitize(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}

export function setSafeHtml(el: HTMLElement, html: string) {
  // Prefer text only if you don't need markup
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    el.textContent = html;
    return;
  }
  el.innerHTML = sanitize(html);
}

export function SafeHtml({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitize(html) }} />;
}