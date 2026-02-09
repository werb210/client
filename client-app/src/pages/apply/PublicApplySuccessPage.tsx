import { Link } from "react-router-dom";

export default function PublicApplySuccessPage() {
  return (
    <main style={{ padding: "32px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
        Application received
      </h1>
      <p style={{ color: "#4b5563", marginBottom: 24 }}>
        Thanks for submitting your application. We will review it and follow up
        with next steps shortly.
      </p>
      <Link
        to="/portal"
        style={{
          display: "inline-flex",
          padding: "12px 20px",
          borderRadius: 8,
          background: "#111827",
          color: "white",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Go to client portal
      </Link>
    </main>
  );
}
