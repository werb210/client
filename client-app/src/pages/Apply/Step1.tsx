import { useEffect, useState } from "react";
import { fetchStep1Questions } from "../../api/questions";
import { useQuestions } from "../../state/questions";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

export default function Step1() {
  const nav = useNavigate();
  const { token } = useAuthContext();
  const { step1, setStep1 } = useQuestions();
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!step1) {
        const { data } = await fetchStep1Questions();
        setStep1(data.questions);
      }
      setLoading(false);
    }
    load();
  }, [setStep1, step1]);

  useEffect(() => {
    if (!token) {
      nav("/");
    }
  }, [nav, token]);

  if (!token) return null;

  if (loading) return <div className="p-6">Loading questions…</div>;

  function updateField(id: string, value: any) {
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  function handleNext() {
    localStorage.setItem("app_step1", JSON.stringify(form));
    nav("/apply/step-2");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Business KYC</h1>

      {step1?.map((q) => (
        <div key={q.id} className="mb-5">
          <label className="block mb-2 font-semibold">{q.label}</label>

          {q.type === "text" && (
            <input
              className="border p-3 w-full"
              onChange={(e) => updateField(q.id, e.target.value)}
            />
          )}

          {q.type === "number" && (
            <input
              type="number"
              className="border p-3 w-full"
              onChange={(e) => updateField(q.id, +e.target.value)}
            />
          )}

          {q.type === "boolean" && (
            <select
              className="border p-3 w-full"
              onChange={(e) => updateField(q.id, e.target.value === "yes")}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          )}

          {q.type === "select" && (
            <select
              className="border p-3 w-full"
              onChange={(e) => updateField(q.id, e.target.value)}
            >
              <option value="">Select</option>
              {q.options?.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          )}

          {q.type === "radio" && (
            <div className="flex gap-4">
              {q.options?.map((o) => (
                <label key={o}>
                  <input
                    type="radio"
                    name={q.id}
                    value={o}
                    onChange={() => updateField(q.id, o)}
                  />
                  <span className="ml-2">{o}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleNext}
        className="bg-borealBlue text-white p-3 rounded w-full mt-6"
      >
        Continue
      </button>
    </div>
  );
}
