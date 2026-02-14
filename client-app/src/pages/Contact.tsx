import { useState, type ChangeEvent, type FormEvent } from "react";
import { submitContactForm } from "@/api/website";

export default function Contact() {
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await submitContactForm(form);
      setSuccess(true);
    } catch {
      setError("Unable to submit contact form right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold mb-6 text-white">Contact Boreal</h1>

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

        {success && (
          <p className="text-emerald-300 text-sm">
            A Boreal Intake Specialist will contact you shortly.
          </p>
        )}
        {error && <p className="text-red-300 text-sm">{error}</p>}

        <button
          className="bg-blue-600 px-6 py-3 rounded text-white disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
