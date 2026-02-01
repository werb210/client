import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { components, tokens } from "@/styles";

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
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40 }}>
      <div style={{ maxWidth: "var(--portal-max-width)", margin: "0 auto", padding: "0 16px 24px" }}>
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.spacing.sm,
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: tokens.colors.primary }}>
                We use cookies to improve your experience.
              </div>
              <p style={components.form.helperText}>
                By using Boreal Financial, you agree to our cookie policy and
                privacy practices.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: tokens.spacing.sm }}>
              <Button style={{ padding: "0 24px" }} onClick={accept}>
                Accept Cookies
              </Button>
              <Button variant="secondary" style={{ padding: "0 24px" }} onClick={decline}>
                Decline
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
