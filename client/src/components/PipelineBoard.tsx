// src/components/PipelineBoard.tsx
import { useEffect, useState } from 'react';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json();
};

export default function PipelineBoard() {
  const [lanes, setLanes] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchPipeline = async () => {
    setLoading(true);
    const data = await fetcher('/api/pipeline/board');
    setLanes(data.lanes || {});
    setLoading(false);
  };

  useEffect(() => {
    fetchPipeline();

    // 🔄 Optional real-time updates if WebSocket is active
    const ws = new WebSocket(`wss://staff.boreal.financial?token=${localStorage.getItem('authToken')}`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'APPLICATION_PIPELINE_UPDATE') {
        fetchPipeline();
      }
    };

    return () => ws.close();
  }, []);

  if (loading) return <div>Loading pipeline...</div>;

  return (
    <div>
      <h1>Sales Pipeline</h1>
      <div className="lanes">
        {Object.entries(lanes).map(([stage, apps]: [string, any[]]) => (
          <div key={stage} className="lane">
            <h2>{stage} ({apps.length})</h2>
            {apps.map((app) => (
              <div key={app.id} className="card">
                <strong>{app.business_name}</strong>
                <p>Requested: ${app.requested_amount || 0}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={fetchPipeline}>🔄 Refresh</button>
    </div>
  );
}