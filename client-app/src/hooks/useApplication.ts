import { useEffect, useState } from "react";
import { applicationApi } from "../api/application";
import { getSession } from "../utils/clientSession";

export function useApplication() {
  const { applicationId } = getSession();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!applicationId) return;
    applicationApi.fetchRequiredDocuments(applicationId).then((res) => {
      setData(res.data);
    });
  }, []);

  async function save(step: number, values: any) {
    return applicationApi.saveStep(applicationId!, step, values);
  }

  async function submit() {
    return applicationApi.submitApplication(applicationId!);
  }

  return { data, save, submit };
}
