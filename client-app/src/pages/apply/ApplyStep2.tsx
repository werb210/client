import { useNavigate } from "react-router-dom";

export default function ApplyStep2() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="card">
        <h2>Next Steps</h2>
        <p>Upload required documents to continue.</p>

        <button onClick={() => navigate("/apply/documents")}>
          Upload Documents
        </button>
      </div>
    </div>
  );
}
