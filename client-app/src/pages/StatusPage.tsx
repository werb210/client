import { ClientAppAPI } from "../api/clientApp";
import { useEffect, useState } from "react";

export function StatusPage() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    ClientAppAPI.status(token).then((res) => setStatus(res.data));
  }, [token]);

  if (!token) return <div>Missing token.</div>;
  if (!status) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Application Status</h1>
      <pre className="bg-gray-100 p-3">
        {JSON.stringify(status, null, 2)}
      </pre>
    </div>
  );
}
