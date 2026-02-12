import { useState } from "react";
import { trackEvent } from "../utils/analytics";

export default function CapitalScorePreview() {
  const [score, setScore] = useState<any>(null);

  async function calculate() {
    trackEvent("capital_score_requested");

    const res = await fetch("/api/scoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revenue: 200000,
        timeInBusiness: 24,
        creditScore: 680,
      }),
    });

    const data = await res.json();
    setScore(data);
  }

  return (
    <div>
      <button onClick={calculate}>Preview Your Capital Readiness</button>

      {score && (
        <div>
          <p>Score: {score.score}</p>
          <p>Rating: {score.rating}</p>
        </div>
      )}
    </div>
  );
}
