import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";

type Types = "subscription" | "perpetual";
type License = {
  _id: string;
  key: string;
  name: string;
  vendor: string;
  type: "subscription" | "perpetual";
  seatsTotal: number;
  seatsUsed: number;
  expiresAt?: string;
  isActive: boolean;
  updatedAt: string;
};

export default function Licenses() {
  const { user } = useAuth();
  const canWrite = user?.role === "admin";

  const [q, setQ] = useState("");
  const [vendor, setVendor] = useState("");
  const [type, setType] = useState<"" | "subscription" | "perpetual">("");
  const [expiringInDays, setExpiringInDays] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<License[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (vendor.trim()) p.set("vendor", vendor.trim());
    if (type) p.set("type", type);
    if (expiringInDays.trim()) p.set("expiringInDays", expiringInDays.trim());
    p.set("page", String(page));
    p.set("limit", "25");
    return p.toString();
  }, [q, vendor, type, expiringInDays, page]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ items: License[]; totalPages: number }>(
        `/api/licenses?${query}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
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
              <h1 className="text-2xl font-semibold">Licenses</h1>
              <p className="text-slate-400 mt-1">
                Software licenses & subscriptions
              </p>
            </div>
            <div className="flex gap-2">
              {canWrite && (
                <Link
                  to="/licenses/new"
                  className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
                >
                  + New License
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
                placeholder="key, name, vendor"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Type</label>
              <select
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={type}
                onChange={(e) => {
                  setPage(1);
                  setType(e.target.value as Types);
                }}
              >
                <option value="">All</option>
                <option value="subscription">subscription</option>
                <option value="perpetual">perpetual</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Expiring in days</label>
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

            <div className="sm:col-span-2">
              <label className="text-sm text-slate-300">Vendor</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={vendor}
                onChange={(e) => {
                  setPage(1);
                  setVendor(e.target.value);
                }}
                placeholder="Microsoft, Adobe..."
              />
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
              Licenses
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
                {items.map((l) => {
                  const remaining = Math.max(0, l.seatsTotal - l.seatsUsed);
                  const exp = l.expiresAt ? new Date(l.expiresAt) : null;
                  const expSoon = exp
                    ? exp.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
                    : false;

                  return (
                    <Link
                      key={l._id}
                      to={`/licenses/${l._id}`}
                      className="block p-4 hover:bg-slate-900/30"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-medium text-slate-100">
                              {l.key}
                            </div>
                            <div className="text-slate-300">{l.name}</div>
                            <div className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                              {l.vendor}
                            </div>
                            <div className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                              {l.type}
                            </div>
                            {!l.isActive && (
                              <div className="text-xs rounded-lg border border-red-900 px-2 py-1 text-red-200 bg-red-950/20">
                                inactive
                              </div>
                            )}
                            {expSoon && (
                              <div className="text-xs rounded-lg border border-amber-900 px-2 py-1 text-amber-200 bg-amber-950/20">
                                expiring soon
                              </div>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            Seats:{" "}
                            <span className="text-slate-200">
                              {l.seatsUsed}
                            </span>{" "}
                            /{" "}
                            <span className="text-slate-200">
                              {l.seatsTotal}
                            </span>{" "}
                            <span className="text-slate-500">
                              (remaining {remaining})
                            </span>
                            {l.expiresAt ? (
                              <span className="text-slate-500">
                                {" "}
                                • Expires{" "}
                                {new Date(l.expiresAt).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-sm text-slate-500">
                          Updated {new Date(l.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
