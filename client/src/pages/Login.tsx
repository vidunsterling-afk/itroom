import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const { signIn, loading } = useAuth();
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      await signIn(identifier.trim(), password);
      nav("/", { replace: true });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("Login failed");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow">
        <h1 className="text-2xl font-semibold">ITRoom</h1>
        <p className="text-slate-400 mt-1">Sign in to continue</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300">Username or Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-slate-600"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:border-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
              {err}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-100 text-slate-950 py-2 font-medium hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          Accounts are created by admins.
        </p>
      </div>
    </div>
  );
}
