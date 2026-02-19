import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { Role } from "../lib/auth";

export function RoleRoute({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
