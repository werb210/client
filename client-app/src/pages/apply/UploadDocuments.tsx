export default function UploadDocuments() {
  const appId = localStorage.getItem("applicationId");

  async function upload(file: File) {
    const form = new FormData();
    form.append("applicationId", appId!);
    form.append("category", "bank_statement");
    form.append("file", file);

    await fetch("/api/documents", {
      method: "POST",
      headers: { "X-Request-Id": crypto.randomUUID() },
      body: form,
    });
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Upload Documents</h2>

        <input
          type="file"
          onChange={(e) => e.target.files && upload(e.target.files[0])}
        />
      </div>
    </div>
  );
}
