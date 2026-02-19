import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
