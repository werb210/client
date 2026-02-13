import { useState } from "react";
import { createLead } from "@/lib/api";

export default function Contact() {
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await createLead({
      ...form,
      source: "contact",
    });

    alert("Submitted.");
  };

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold mb-6 text-white">
        Contact Boreal
      </h1>

      <p className="text-white text-xl mb-8">
        Tell us about your business and an advisor will follow up.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {Object.keys(form).map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            value={(form as any)[field]}
            onChange={handleChange}
            className="w-full p-4 rounded bg-gray-200 text-black"
          />
        ))}

        <button className="bg-blue-600 px-6 py-3 rounded text-white">
          Submit
        </button>
      </form>
    </div>
  );
}
