import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuthContext();
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}
