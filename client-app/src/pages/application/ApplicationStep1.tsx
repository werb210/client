import { useState } from "react";
import { createApplication } from "../../services/applicationService";

export default function ApplicationStep1() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");

  const submit = async () => {
    await createApplication({
      companyName,
      contactName,
      email,
    });
    alert("Application started");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Business Information</h1>

      <input
        placeholder="Company Name"
        value={companyName}
        onChange={(event) => setCompanyName(event.target.value)}
      />

      <input
        placeholder="Contact Name"
        value={contactName}
        onChange={(event) => setContactName(event.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <button onClick={() => void submit()} type="button">
        Start Application
      </button>
    </div>
  );
}
