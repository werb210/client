export function CreditScoreModal() {
  const score = Math.floor(Math.random() * 100);

  return (
    <div className="modal">
      <h3>Your Capital Readiness Score</h3>
      <p>{score} / 100</p>
      <p>This is a preview only. Full scoring happens after submission.</p>
    </div>
  );
}
