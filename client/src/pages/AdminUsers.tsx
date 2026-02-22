import React, { useState } from "react";
import { getAccessToken } from "../lib/auth";
import { apiFetch } from "../lib/api";
import Layout from "../components/Layout";

type Role = "admin" | "auditor" | "staff";
type UserDTO = {
  username: string;
  role: string;
};

export default function AdminUsers() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const token = getAccessToken();
    if (!token) return setErr("No access token. Please login again.");

    try {
      const data = await apiFetch<{ user: UserDTO }>("/api/users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username, email, password, role }),
      });

      setMsg(`Created: ${data.user.username} (${data.user.role})`);
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("staff");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-semibold">Create User</h1>
          <p className="text-slate-400 mt-1">Admin-only user creation</p>

          <form
            onSubmit={createUser}
            className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4"
          >
            <div>
              <label className="text-sm text-slate-300">Username</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Min 8 chars (you can enforce stronger rules later)
              </p>
            </div>

            <div>
              <label className="text-sm text-slate-300">Role</label>
              <select
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="staff">staff</option>
                <option value="auditor">auditor</option>
                <option value="admin">admin</option>
              </select>
            </div>

            {msg && (
              <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-3 text-sm text-emerald-200">
                {msg}
              </div>
            )}
            {err && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                {err}
              </div>
            )}

            <button className="w-full rounded-xl bg-slate-100 text-slate-950 py-2 font-medium hover:opacity-90">
              Create
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
