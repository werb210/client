"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import getPortalData from "../api/getPortalData";
import uploadAdditionalDocument from "../api/uploadAdditionalDocument";
import PortalDocumentCard from "../components/PortalDocumentCard";
import { useAuthContext } from "../context/AuthContext";
import { useSessionStore } from "../state/sessionStore";

interface PortalData {
  applicationStatus?: string;
  requiredDocuments?: Array<{
    type: string;
    label: string;
    description?: string;
  }>;
  [key: string]: unknown;
}

export default function Portal() {
  const navigate = useNavigate();
  const { token: authToken, user, logout } = useAuthContext();
  const { email, token, setSession, clearSession } = useSessionStore();

  const [loading, setLoading] = useState(true);
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [error, setError] = useState("");

  const sessionEmail = useMemo(() => {
    if (email) return email;
    if (user && typeof user === "object" && "email" in user) {
      return (user as { email?: string }).email || "";
    }
    return "";
  }, [email, user]);

  const sessionToken = token || authToken || "";

  useEffect(() => {
    if (sessionEmail && sessionToken) {
      setSession(sessionEmail, sessionToken);
    }
  }, [sessionEmail, sessionToken, setSession]);

  async function load() {
    if (!sessionEmail || !sessionToken) {
      setError("Unable to load portal data");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getPortalData(sessionEmail, sessionToken);
      setPortalData(data);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Unable to load portal data");
      setPortalData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionEmail, sessionToken]);

  async function handleUpload(docType: string, file: File) {
    try {
      await uploadAdditionalDocument(sessionEmail, sessionToken, docType, file);
      load();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  }

  function handleLogout() {
    clearSession();
    logout();
    navigate("/");
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!portalData)
    return <div className="p-8 text-red-600">{error || "No data"}</div>;

  const { applicationStatus = "", requiredDocuments = [] } = portalData;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Client Portal</h1>
        <button onClick={handleLogout} className="text-red-600 underline">
          Log out
        </button>
      </div>

      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Application Status</h2>
        <p>{applicationStatus}</p>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-4">Required Documents</h2>
        {requiredDocuments.length === 0 && (
          <p>All documents have been submitted.</p>
        )}
        <div className="space-y-3">
          {requiredDocuments.map((doc) => (
            <PortalDocumentCard
              key={doc.type}
              document={doc}
              onUpload={handleUpload}
            />
          ))}
        </div>
      </div>

      <div className="border rounded p-4 mb-6 bg-gray-50">
        <h2 className="font-semibold mb-2">Chat / Messaging</h2>
        <p className="text-sm mb-2">
          Chat placeholder — full real-time chat will be added later.
        </p>
        <button className="px-4 py-2 rounded bg-blue-600 text-white">
          Talk to a Human
        </button>
      </div>

      <div className="border rounded p-4 bg-gray-50">
        <h2 className="font-semibold mb-2">Report an Issue</h2>
        <button className="px-4 py-2 rounded bg-gray-700 text-white">
          Report Issue
        </button>
      </div>
    </div>
  );
}
