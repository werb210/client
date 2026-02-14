import { useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/api";
import { useApplicationStore } from "@/state/useApplicationStore";

export default function ContinueApplication() {
  const { token } = useParams();
  const { loadFromServer } = useApplicationStore();

  useEffect(() => {
    if (!token) return;

    async function load() {
      const res = await api.get(`/applications/${token}`);
      loadFromServer(res.data);
    }

    void load();
  }, [token]);

  return null;
}
