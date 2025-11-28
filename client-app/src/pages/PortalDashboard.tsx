import { useCallback, useEffect, useMemo, useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import { PortalNav } from "../components/portal/PortalNav";
import { StatusTimeline } from "../components/portal/StatusTimeline";
import { DocumentItem } from "../components/portal/DocumentItem";
import { api } from "../api";
import { requirePortalAuth } from "../utils/requirePortalAuth";

type StatusHistoryItem = {
  status: string;
  timestamp: string | number | Date;
};

type RequiredDocument = {
  id: string;
  label: string;
};

type UploadedDocument = {
  type: string;
  fileName: string;
};

type PortalData = {
  statusHistory?: StatusHistoryItem[];
  requiredDocuments?: RequiredDocument[];
  uploadedDocuments?: UploadedDocument[] | Record<string, UploadedDocument>;
};

export default function PortalDashboard() {
  const auth = requirePortalAuth();
  const applicationId = auth?.applicationId ?? "";

  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);

  const uploadedLookup = useMemo(() => {
    if (!data || !data.uploadedDocuments) return {} as Record<string, UploadedDocument>;

    if (Array.isArray(data.uploadedDocuments)) {
      return data.uploadedDocuments.reduce<Record<string, UploadedDocument>>((acc, doc) => {
        acc[doc.type] = doc;
        return acc;
      }, {});
    }

    return data.uploadedDocuments;
  }, [data]);

  const loadData = useCallback(async () => {
    if (!applicationId) return;

    setLoading(true);
    try {
      const response = await api.get(`/application/${applicationId}`);
      setData(response.data);
    } catch (error) {
      console.error("Unable to load portal data", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!auth) return <PageContainer title="Loading..." />;
  if (loading || !data) return <PageContainer title="Loading..." />;

  const requiredDocuments = data.requiredDocuments ?? [];
  const statusHistory = data.statusHistory ?? [];

  return (
    <PageContainer>
      <PortalNav applicationId={applicationId} />

      <StatusTimeline history={statusHistory} />

      <h2 className="font-bold text-lg mt-6 mb-3">Upload Required Documents</h2>

      {requiredDocuments.map((doc) => (
        <DocumentItem
          key={doc.id}
          doc={doc}
          uploaded={uploadedLookup[doc.id] ?? null}
          onUpload={async (event, docId) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const form = new FormData();
            form.append("file", file);
            form.append("docType", docId);

            await api.post(`/application/${applicationId}/uploadDocument`, form);
            loadData();
          }}
        />
      ))}
    </PageContainer>
  );
}
