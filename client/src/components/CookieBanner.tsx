import { useEffect, useState } from "react";

const LS_KEY = "bf:cookieConsent";

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Prevent duplicate mounts across layouts/portals
    if ((window as any).__BF_COOKIE_BANNER_MOUNTED) return;
    (window as any).__BF_COOKIE_BANNER_MOUNTED = true;

    const v = localStorage.getItem(LS_KEY);
    setOpen(v !== "accepted" && v !== "declined");
  }, []);

  if (!open) return null;

  const set = (val: "accepted" | "declined") => {
    try {
      localStorage.setItem(LS_KEY, val);
      document.cookie = `cookie_consent=${val}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    setOpen(false);               // ✅ no reloads, no routing, no remounts
  };

  return (
    <div data-cookie-banner="bf" className="fixed inset-x-0 bottom-0 z-50 bg-white border-t shadow p-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <span className="text-sm">We use cookies to enhance your experience.</span>
        <div className="flex gap-2">
          <button onClick={() => set("declined")} className="px-3 py-2 rounded border">Decline Optional</button>
          <button onClick={() => set("accepted")} className="px-3 py-2 rounded bg-black text-white">Accept All Cookies</button>
        </div>
      </div>
    </div>
  );
}