import { useEffect, useState } from "react";

const LS_KEY = "bf:cookieConsent"; // localStorage (persists across steps)

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(LS_KEY);
    setOpen(v !== "accepted" && v !== "declined");
  }, []);

  if (!open) return null;

  function accept() {
    try {
      localStorage.setItem(LS_KEY, "accepted");
      // also set a cookie for SSR/CDN if you need it — but DO NOT reload:
      document.cookie = "cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax";
    } catch {}
    setOpen(false);
  }
  function decline() {
    try {
      localStorage.setItem(LS_KEY, "declined");
      document.cookie = "cookie_consent=declined; path=/; max-age=31536000; SameSite=Lax";
    } catch {}
    setOpen(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t shadow p-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <span className="text-sm">
          We use cookies to enhance your experience. Manage your preferences anytime.
        </span>
        <div className="flex gap-2">
          <button onClick={decline} className="px-3 py-2 rounded border">Decline Optional</button>
          <button onClick={accept} className="px-3 py-2 rounded bg-black text-white">Accept All Cookies</button>
        </div>
      </div>
    </div>
  );
}