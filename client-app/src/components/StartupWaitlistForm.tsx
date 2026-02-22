import { useState } from "react";
import { joinStartupWaitlist } from "../services/mayaService";

export function StartupWaitlistForm() {
  const [data, setData] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    await joinStartupWaitlist(data);
    setSubmitted(true);
  }

  if (submitted) {
    return <div>Thanks! We will notify you when startup funding is available.</div>;
  }

  return (
    <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem" }}>
      <input
        placeholder="Name"
        onChange={(e) => setData({ ...data, name: e.target.value })}
        value={data.name}
      />
      <input
        placeholder="Email"
        onChange={(e) => setData({ ...data, email: e.target.value })}
        value={data.email}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        value={data.phone}
      />
      <button onClick={submit}>Notify Me</button>
    </div>
  );
}
