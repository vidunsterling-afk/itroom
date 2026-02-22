import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";

type Repair = {
  _id: string;
  assetId: string;
  vendorName: string;
  cost: number;
  status:
    | "reported"
    | "sent"
    | "repairing"
    | "returned"
    | "closed"
    | "cancelled";
  reportedAt: string;
  issue: string;
  isWarrantyClaim: boolean;
  warrantyExpiry?: string;
  createdAt: string;
};

export default function Repairs() {
  const { user } = useAuth();
  const canWrite = user?.role === "admin"; // you can later allow staff if permissions allow UI

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [warrantyOnly, setWarrantyOnly] = useState(false);
  const [expiringInDays, setExpiringInDays] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Repair[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (status) p.set("status", status);
    if (warrantyOnly) p.set("warrantyOnly", "true");
    if (expiringInDays.trim()) p.set("expiringInDays", expiringInDays.trim());
    p.set("page", String(page));
    p.set("limit", "25");
    return p.toString();
  }, [q, status, warrantyOnly, expiringInDays, page]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ items: Repair[]; totalPages: number }>(
        `/api/repairs?${query}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load repairs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [query]);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Repairs</h1>
              <p className="text-slate-400 mt-1">Service & repairs tracking</p>
            </div>
            <div className="flex gap-2">
              {canWrite && (
                <Link
                  to="/repairs/new"
                  className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
                >
                  + New Repair
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

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-300">Search</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="vendor, issue, resolution, notes..."
              />
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
                <option value="reported">reported</option>
                <option value="sent">sent</option>
                <option value="repairing">repairing</option>
                <option value="returned">returned</option>
                <option value="closed">closed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">
                Warranty expiring in days
              </label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={expiringInDays}
                onChange={(e) => {
                  setPage(1);
                  setExpiringInDays(e.target.value);
                }}
                placeholder="30"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
              <input
                type="checkbox"
                checked={warrantyOnly}
                onChange={(e) => {
                  setPage(1);
                  setWarrantyOnly(e.target.checked);
                }}
              />
              Warranty claims only
            </label>
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
              Repair Records
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
                {items.map((r) => (
                  <Link
                    key={r._id}
                    to={`/repairs/${r._id}`}
                    className="block p-4 hover:bg-slate-900/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-100">
                            {r.vendorName}
                          </span>
                          <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                            {r.status}
                          </span>
                          {r.isWarrantyClaim && (
                            <span className="text-xs rounded-lg border border-emerald-900 px-2 py-1 text-emerald-200 bg-emerald-950/20">
                              warranty
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          {r.issue} • Cost:{" "}
                          <span className="text-slate-200">{r.cost ?? 0}</span>
                          {r.warrantyExpiry ? (
                            <span className="text-slate-500">
                              {" "}
                              • Warranty expiry{" "}
                              {new Date(r.warrantyExpiry).toLocaleDateString()}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(r.reportedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
