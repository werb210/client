import { useEffect, useState } from "react";
import { Button } from "./ui/Button";

const STORAGE_KEY = "boreal_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setVisible(stored !== "accepted");
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <div className="boreal-card px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-borealBlue">
              We use cookies to improve your experience.
            </div>
            <p className="text-sm text-slate-500">
              By using Boreal Financial, you agree to our cookie policy and
              privacy practices.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="px-6" onClick={accept}>
              Accept Cookies
            </Button>
            <button
              className="boreal-button boreal-button-secondary px-6 h-12"
              onClick={decline}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
