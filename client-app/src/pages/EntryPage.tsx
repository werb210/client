import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClientProfileStore } from "../state/clientProfiles";

export function EntryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (ClientProfileStore.hasAnyProfile()) {
      navigate("/portal", { replace: true });
    } else {
      navigate("/apply/step-1", { replace: true });
    }
  }, [navigate]);

  return null;
}
