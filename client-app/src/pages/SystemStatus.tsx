import { buildInfo } from "../buildInfo";

export default function SystemStatus() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Client System Status</h1>
      <p>Mode: {buildInfo.mode}</p>
      <p>Build Time: {buildInfo.timestamp}</p>
      <p>Status: OK</p>
    </div>
  );
}
