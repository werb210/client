import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadDocuments() {
  const navigate = useNavigate();
  const applicationId = localStorage.getItem("applicationId");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  async function upload(file: File) {
    if (!applicationId) {
      setStatus("error");
      setMessage("Missing application ID. Please restart your application.");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading your document...");
    setProgress(35);

    const form = new FormData();
    form.append("applicationId", applicationId);
    form.append("category", "bank_statement");
    form.append("file", file);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "X-Request-Id": crypto.randomUUID() },
        body: form,
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

  const isBlocked = !applicationId;

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
