type ContactData = {
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export async function submitContact(data: ContactData) {
  await fetch("/api/support/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
