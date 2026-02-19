import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";

type Row = {
  moduleKey: string;
  moduleName: string;
  availableActions: string[];
  staffActions: string[];
};

export default function Permissions() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ items: Row[] }>("/api/permissions/staff", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setRows(data.items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(moduleKey: string, action: string) {
    setErr(null);
    setMsg(null);

    const current = rows.find((r) => r.moduleKey === moduleKey);
    if (!current) return;

    const has = current.staffActions.includes(action);
    const next = has
      ? current.staffActions.filter((a) => a !== action)
      : [...current.staffActions, action];

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      await apiFetch("/api/permissions/staff", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ moduleKey, actions: next }),
      });

      setRows((prev) =>
        prev.map((r) =>
          r.moduleKey === moduleKey ? { ...r, staffActions: next } : r,
        ),
      );
      setMsg(`Updated staff permissions for ${moduleKey}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">Staff Permissions</h1>
            <p className="text-slate-400 mt-1">
              Admin only. Auditor remains read-only globally.
            </p>
          </div>
          <button
            onClick={load}
            className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>

        {msg && (
          <div className="mt-4 rounded-xl border border-emerald-900 bg-emerald-950/30 p-3 text-sm text-emerald-200">
            {msg}
          </div>
        )}
        {err && (
          <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
            Modules
          </div>

          {loading ? (
            <div className="p-4 text-slate-400">Loading...</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {rows.map((r) => (
                <div key={r.moduleKey} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{r.moduleName}</div>
                      <div className="text-sm text-slate-500">
                        {r.moduleKey}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {r.availableActions.map((a) => {
                        const on = r.staffActions.includes(a);
                        return (
                          <button
                            key={a}
                            onClick={() => toggle(r.moduleKey, a)}
                            className={`text-xs rounded-lg border px-2 py-1 ${
                              on
                                ? "border-emerald-900 text-emerald-200 bg-emerald-950/20"
                                : "border-slate-800 text-slate-300 bg-slate-950"
                            }`}
                          >
                            {a}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
