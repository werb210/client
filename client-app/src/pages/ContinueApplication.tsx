import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api";
import { useApplicationStore } from "@/state/useApplicationStore";

export default function ContinueApplication() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loadFromServer } = useApplicationStore();

  useEffect(() => {
    if (!token) return;
    let active = true;

    async function load() {
      try {
        const res = await api.get(`/applications/${token}`, { timeout: 15000 });
        if (!active) return;
        loadFromServer(res.data);
      } catch {
        if (!active) return;
        navigate("/apply", { replace: true });
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [token, loadFromServer, navigate]);

  return null;
}
