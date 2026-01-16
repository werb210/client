import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      navigate(`/resume?token=${encodeURIComponent(token)}`, { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <div className="page">
      <header className="header">Boreal Financial</header>

      <div className="card">
        <h1>Funding that keeps your business moving</h1>
        <p>
          Start your Boreal application in minutes and pick up where you left
          off with your secure SMS link.
        </p>

        <button onClick={() => navigate("/apply/step-1")}>
          Start Application
        </button>
      </div>
    </div>
  );
}
