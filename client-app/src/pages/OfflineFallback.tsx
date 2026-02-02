import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { components, layout } from "@/styles";

export function OfflineFallback() {
  return (
    <div style={layout.page}>
      <div style={layout.centerColumn}>
        <Card>
          <div style={layout.stackTight}>
            <div style={components.form.eyebrow}>Offline mode</div>
            <h1 style={components.form.title}>Limited access</h1>
            <p style={components.form.subtitle}>
              You’re offline, so the portal is available in read-only mode.
              Reconnect to upload documents, send messages, or submit updates.
            </p>
            <Button
              style={{ width: "100%", maxWidth: "260px" }}
              onClick={() => window.location.reload()}
            >
              Retry connection
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
