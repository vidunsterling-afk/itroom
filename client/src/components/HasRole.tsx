import type { ReactNode } from "react";
import { useAuth } from "../context/useAuth";
import type { Role } from "../lib/auth";
import { DashboardNavCardDenied } from "./DashboardNavCard";

type Props = {
  roles: readonly Role[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function HasRole({ roles, fallback, children }: Props) {
  const { user } = useAuth();

  if (!user) return fallback ?? null;
  if (!roles.includes(user.role)) {
    return (
      fallback ?? (
        <DashboardNavCardDenied
          title="Access denied"
          description="You don't have permission to view this section."
        />
      )
    );
  }

  return <>{children}</>;
}
