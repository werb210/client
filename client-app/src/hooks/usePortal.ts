import { useEffect, useState } from "react";
import { portalApi } from "../api/portal";
import { getSession } from "../utils/clientSession";

export function usePortal() {
  const { applicationId } = getSession();
  const [portal, setPortal] = useState(null);

  useEffect(() => {
    if (!applicationId) return;
    portalApi.fetchApplication(applicationId).then((res) => setPortal(res.data));
  }, []);

  return portal;
}
