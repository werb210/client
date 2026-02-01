import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { components, layout, scrollToFirstError, tokens } from "@/styles";

export default function UploadDocuments() {
  const navigate = useNavigate();
  const applicationToken = localStorage.getItem("applicationToken");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "error" || isBlocked) {
      scrollToFirstError();
    }
  }, [isBlocked, status]);

  async function upload(file: File) {
    if (!applicationToken) {
      setStatus("error");
      setMessage("Missing application token. Please restart your application.");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading your document...");
    setProgress(35);

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.onload = () => {
        const result = String(reader.result || "");
        const encoded = result.includes(",") ? result.split(",")[1] : result;
        resolve(encoded);
      };
      reader.readAsDataURL(file);
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationToken}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Request-Id": crypto.randomUUID(),
          },
          body: JSON.stringify({
            documents: {
              bank_statement: {
                name: file.name,
                base64,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setProgress(100);
      setStatus("success");
      setMessage("Upload received. We'll review it shortly.");
    } catch (err) {
      setStatus("error");
      setMessage("Upload failed. Please try again.");
    }
  }

  const isBlocked = !applicationToken;

  return (
    <div style={layout.page}>
      <div style={layout.centerColumn}>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
            <div style={components.form.eyebrow}>Step 4 of 4</div>
            <h2 style={components.form.sectionTitle}>Document upload</h2>
            <p style={components.form.subtitle}>
              Provide a recent bank statement to complete your application.
            </p>

            {isBlocked && (
              <div style={components.form.errorText} data-error={true}>
                Application details are missing. Please start again.
              </div>
            )}

            <input
              type="file"
              disabled={isBlocked}
              style={components.inputs.base}
              onChange={(e) => e.target.files && upload(e.target.files[0])}
            />

            {(status === "uploading" || status === "success") && (
              <div>
                <progress
                  value={progress}
                  max={100}
                  style={{ width: "100%", height: "8px", accentColor: tokens.colors.primary }}
                />
              </div>
            )}

            {message && (
              <div
                style={
                  status === "error"
                    ? components.form.errorText
                    : components.form.helperText
                }
                data-error={status === "error" || undefined}
              >
                {message}
              </div>
            )}

            {status === "error" && (
              <Button onClick={() => navigate("/apply/step-1")}>
                Restart application
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
