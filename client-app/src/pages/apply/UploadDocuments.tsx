import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";

export default function UploadDocuments() {
  const navigate = useNavigate();
  const applicationToken = localStorage.getItem("applicationToken");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

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
      });

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
    <div className="page">
      <div className="card">
        <div className="step">Step 4 of 4</div>
        <h2>Document upload</h2>
        <p>Provide a recent bank statement to complete your application.</p>

        {isBlocked && (
          <div className="error">
            Application details are missing. Please start again.
          </div>
        )}

        <input
          type="file"
          disabled={isBlocked}
          onChange={(e) => e.target.files && upload(e.target.files[0])}
        />

        {(status === "uploading" || status === "success") && (
          <div className="progress">
            <progress value={progress} max={100} />
          </div>
        )}

        {message && <div className={`notice ${status}`}>{message}</div>}

        {status === "error" && (
          <button onClick={() => navigate("/apply/step-1")}>
            Restart application
          </button>
        )}
      </div>
    </div>
  );
}
