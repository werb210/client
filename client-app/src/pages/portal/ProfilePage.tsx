import React from "react";
import { Navigate } from "react-router-dom";
import useClientSession from "../../state/useClientSession";

export default function ProfilePage() {
  const token = useClientSession();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>

      <div className="bg-white shadow rounded-lg p-4">
        <p className="text-gray-700">Your client profile details will appear here.</p>
      </div>
    </div>
  );
}
