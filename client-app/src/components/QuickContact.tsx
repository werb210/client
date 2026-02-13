import { useState } from "react";
import { submitContactForm } from "@/api/website";

export default function QuickContact() {
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });

  async function handleSubmit() {
    try {
      await submitContactForm(form);
      alert("A Boreal Intake Specialist will contact you shortly.");
      window.location.href = "/";
    } catch {
      alert("Submission failed. Please try again.");
    }
  }

  return (
    <div>
      <input
        placeholder="Company"
        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
      />
      <input
        placeholder="Full Name"
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />
      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        placeholder="Message"
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button onClick={() => void handleSubmit()}>Submit</button>
    </div>
  );
}
