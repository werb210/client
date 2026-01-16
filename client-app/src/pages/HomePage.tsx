import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="header">Boreal Financial</header>

      <div className="card">
        <h1>Welcome to Boreal Financial</h1>
        <p>Start a new funding application in under 5 minutes.</p>

        <button onClick={() => navigate("/apply/step-1")}>
          Start new application
        </button>
      </div>
    </div>
  );
}
