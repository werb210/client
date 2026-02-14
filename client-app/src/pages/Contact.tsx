import { useState, type ChangeEvent, type FormEvent } from "react";
import { createLead } from "@/services/lead";
import { submitContactForm } from "@/api/website";

export default function Contact() {
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { leadId, pendingApplicationId } = await createLead(form);
      localStorage.setItem("leadId", leadId);
      localStorage.setItem("pendingApplicationId", pendingApplicationId);
      localStorage.setItem("leadEmail", form.email);

      await submitContactForm(form);
      alert("A Boreal Intake Specialist will contact you shortly.");
      window.location.href = "/";
    } catch {
      alert("Unable to submit contact form right now. Please try again.");
    }
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
            value={(form as Record<string, string>)[field]}
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
