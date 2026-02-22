import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";

type Status = "SUCCESS" | "FAIL";
type AuditItem = {
  _id: string;
  actorUsername?: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  status: "SUCCESS" | "FAIL";
  ip?: string;
  userAgent?: string;
  createdAt: string;
};

export default function Audit() {
  const [module, setModule] = useState("");
  const [actor, setActor] = useState("");
  const [status, setStatus] = useState<"" | "SUCCESS" | "FAIL">("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<AuditItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (module.trim()) p.set("module", module.trim());
    if (actor.trim()) p.set("actor", actor.trim());
    if (status) p.set("status", status);
    p.set("page", String(page));
    p.set("limit", "25");
    return p.toString();
  }, [module, actor, status, page]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const token = getAccessToken();
        if (!token) throw new Error("No access token. Please login again.");

        const data = await apiFetch<{
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          items: AuditItem[];
        }>(`/api/audit?${query}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        setItems(data.items);
        setTotalPages(data.totalPages || 1);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    })();
  }, [query]);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Audit Trail</h1>
              <p className="text-slate-400 mt-1">
                Tracked events across all modules
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900 disabled:opacity-50"
              >
                Prev
              </button>
              <div className="px-3 py-2 text-slate-300">
                Page <span className="text-slate-100">{page}</span> /{" "}
                <span className="text-slate-100">{totalPages}</span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm text-slate-300">Module</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={module}
                onChange={(e) => {
                  setPage(1);
                  setModule(e.target.value);
                }}
                placeholder="auth, users, inventory..."
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Actor (username)</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={actor}
                onChange={(e) => {
                  setPage(1);
                  setActor(e.target.value);
                }}
                placeholder="itroomadmin"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Status</label>
              <select
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value as Status);
                }}
              >
                <option value="">All</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAIL">FAIL</option>
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
              Latest first
            </div>

            {loading ? (
              <div className="p-4 text-slate-400">Loading...</div>
            ) : err ? (
              <div className="p-4 text-red-200 bg-red-950/30 border-t border-red-900/60">
                {err}
              </div>
            ) : items.length === 0 ? (
              <div className="p-4 text-slate-400">No results</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {items.map((it) => (
                  <div key={it._id} className="p-4 hover:bg-slate-900/30">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-slate-200 font-medium">
                        {it.module}
                      </span>
                      <span className="text-slate-400">{it.action}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-lg border ${
                          it.status === "SUCCESS"
                            ? "border-emerald-900 text-emerald-200 bg-emerald-950/20"
                            : "border-red-900 text-red-200 bg-red-950/20"
                        }`}
                      >
                        {it.status}
                      </span>
                      <span className="text-slate-500 text-sm">
                        {new Date(it.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-slate-300">
                      <span className="text-slate-400">Actor:</span>{" "}
                      {it.actorUsername ?? "anonymous"}
                      {it.entityId ? (
                        <>
                          {" "}
                          <span className="text-slate-500">•</span>{" "}
                          <span className="text-slate-400">Entity:</span>{" "}
                          {it.entityType ?? "?"}:{it.entityId}
                        </>
                      ) : null}
                    </div>

                    {it.summary && (
                      <div className="mt-2 text-sm text-slate-300">
                        {it.summary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
