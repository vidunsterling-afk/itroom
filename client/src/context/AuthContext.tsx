import React, { useEffect, useMemo, useState } from "react";
import { login, logout, me, refresh, type Role } from "../lib/auth";
import { AuthCtx } from "./AuthCtx";

export type AuthUser = { username: string; role: Role };

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
        const { user } = await me();
        setUser({ username: user.username, role: user.role });
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn(identifier: string, password: string) {
    setLoading(true);
    try {
      const u = await login(identifier, password);
      setUser({ username: u.username, role: u.role });
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
