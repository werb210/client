import { useNavigate } from "react-router-dom";
import { useApplicationValidator } from "@/hooks/useApplicationValidator";
import { useApplicationStore } from "@/state/applicationStore";
import { Button } from "@/components/ui/Button";

export default function Step6Submit() {
  const navigate = useNavigate();
  const { validateAll } = useApplicationValidator();
  const { saveToServer } = useApplicationStore();

  async function handleSubmit() {
    const result = validateAll();
    if (!result.ok) {
      alert(result.errors.join("\n"));
      return;
    }

    await saveToServer(null);
    navigate("/portal");
  }

  return (
    <div>
      <h1>Review & Submit</h1>
      <Button onClick={handleSubmit}>Submit Application</Button>
    </div>
  );
}
