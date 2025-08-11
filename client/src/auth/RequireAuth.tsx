import React from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "./AuthProvider";
export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  if (loading) return <div className="p-6 text-sm">Checking session…</div>;
  if (!user) return <Redirect to="/login" />;
  return children;
}