import { useEffect, useState } from "react";
import { applicationApi } from "../api/application";

export function useRequiredDocuments(productId: string | null) {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    if (!productId) return;
    applicationApi.fetchRequiredDocuments(productId).then((res) => {
      setDocs(res.data);
    });
  }, [productId]);

  return docs;
}
