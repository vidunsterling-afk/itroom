import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";

type Asset = {
  _id: string;
  assetTag: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  serialNumber?: string;
  status: "active" | "in-repair" | "retired";
  currentAssignment?: null | {
    assigneeType: "employee" | "external";
    employeeId?: string;
    assigneeName: string;
    assignedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function Assets() {
  const { user } = useAuth();
  const canWrite = user?.role === "admin";

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Asset[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (category) p.set("category", category);
    if (status) p.set("status", status);
    p.set("page", String(page));
    p.set("limit", "25");
    return p.toString();
  }, [q, category, status, page]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token. Please login again.");

      const data = await apiFetch<{
        totalPages: number;
        items: Asset[];
      }>(`/api/assets?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Assets</h1>
            <p className="text-slate-400 mt-1">Inventory + assignments</p>
          </div>

          <div className="flex gap-2">
            {canWrite && (
              <Link
                to="/assets/new"
                className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
              >
                + New Asset
              </Link>
            )}
            <button
              onClick={load}
              className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="text-sm text-slate-300">Search</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="assetTag, name, serial, assignee..."
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Category</label>
            <select
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="laptop">laptop</option>
              <option value="pc">pc</option>
              <option value="router">router</option>
              <option value="switch">switch</option>
              <option value="server">server</option>
              <option value="monitor">monitor</option>
              <option value="printer">printer</option>
              <option value="other">other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300">Status</label>
            <select
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="active">active</option>
              <option value="in-repair">in-repair</option>
              <option value="retired">retired</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            Page <span className="text-slate-100">{page}</span> /{" "}
            <span className="text-slate-100">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
            Assets
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
              {items.map((a) => (
                <Link
                  key={a._id}
                  to={`/assets/${a._id}`}
                  className="block p-4 hover:bg-slate-900/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-slate-100">
                          {a.assetTag}
                        </div>
                        <div className="text-slate-300">
                          {a.brand} {a.model}
                        </div>
                        <div className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                          {a.category}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-lg border ${
                            a.status === "active"
                              ? "border-emerald-900 text-emerald-200 bg-emerald-950/20"
                              : a.status === "in-repair"
                                ? "border-amber-900 text-amber-200 bg-amber-950/20"
                                : "border-slate-700 text-slate-300 bg-slate-900/20"
                          }`}
                        >
                          {a.status}
                        </div>
                      </div>

                      <div className="mt-1 text-sm text-slate-400">
                        {a.name}
                        {a.serialNumber ? ` • SN: ${a.serialNumber}` : ""}
                      </div>

                      <div className="mt-1 text-sm text-slate-400">
                        Assigned:{" "}
                        <span className="text-slate-200">
                          {a.currentAssignment?.assigneeName ?? "—"}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-slate-500">
                      Updated {new Date(a.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
