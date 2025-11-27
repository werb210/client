import { useNavigate } from "react-router-dom";
import "./application.css";

const steps = [
  "KYC Questions",
  "Choose Product Type",
  "Business Info",
  "Applicant Info",
  "Required Documents",
  "Signature & Submit",
];

const ApplicationIndex = () => {
  const navigate = useNavigate();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Start Your Funding Application</h1>

      <p>This process takes 3–5 minutes.</p>

      <ul>
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <button
        onClick={() => navigate("/application/step-1")}
        style={{ marginTop: "2rem" }}
      >
        Start Application
      </button>
    </main>
  );
};

export default ApplicationIndex;
