import { useState } from "react";

export default function QuickContact() {
  const [form, setForm] = useState({
    company: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  async function submit() {
    await fetch("/api/crm/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Submitted");
  }

  return (
    <div>
      <input
        placeholder="Company"
        onChange={(e) => setForm({ ...form, company: e.target.value })}
      />
      <input
        placeholder="First Name"
        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
      />
      <input
        placeholder="Last Name"
        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
      />
      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <button onClick={submit}>Submit</button>
    </div>
  );
}
