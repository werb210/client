import React from "react";
import { Navigate, Link } from "react-router-dom";
import useClientSession from "../../state/useClientSession";

export default function Start() {
  const token = useClientSession();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Welcome</h1>

        <p className="text-gray-700 mb-6">
          Choose an action to get started.
        </p>

        <div className="space-y-4">
          <Link
            to="/portal/apply"
            className="block bg-blue-600 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-700"
          >
            Start Application
          </Link>

          <Link
            to="/portal/profile"
            className="block bg-white border px-4 py-3 rounded-lg shadow hover:bg-gray-100"
          >
            View Profile
          </Link>

          <Link
            to="/portal/support"
            className="block bg-white border px-4 py-3 rounded-lg shadow hover:bg-gray-100"
          >
            Support / Report an Issue
          </Link>
        </div>
      </div>
    </div>
  );
}
