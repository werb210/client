import { submitContactForm } from "@/api/website";

type ContactData = {
  companyName: string;
  fullName: string;
  phone: string;
  email: string;
  message?: string;
};

export async function submitContact(data: ContactData) {
  const { companyName, fullName, phone, email, message } = data;

  try {
    await submitContactForm({
      companyName,
      fullName,
      phone,
      email,
      message,
    });

    alert("A Boreal Intake Specialist will contact you shortly.");

    window.location.href = "/";
  } catch {
    alert("Submission failed. Please try again.");
  }
}
