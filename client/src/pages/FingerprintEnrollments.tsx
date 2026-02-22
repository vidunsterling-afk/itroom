import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";

type Enrollment = {
  _id: string;
  docNumber: string;
  machineId: string;
  assigneeType: "employee" | "external";
  employeeId?: string;
  externalFullName?: string;
  attendanceEmployeeNo: string;
  status: "assigned" | "pending_hr_signature" | "signed" | "cancelled";
  assignedAt: string;
  createdByUsername?: string;
};

export default function FingerprintEnrollments() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Enrollment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (status) p.set("status", status);
    p.set("page", String(page));
    p.set("limit", "25");
    return p.toString();
  }, [q, status, page]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ items: Enrollment[]; totalPages: number }>(
        `/api/fingerprints/enrollments?${query}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
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
              <h1 className="text-2xl font-semibold">
                Fingerprint Enrollments
              </h1>
              <p className="text-slate-400 mt-1">
                Assign people to fingerprint machines + HR sign
              </p>
            </div>
            <Link
              to="/fingerprints/enrollments/new"
              className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
            >
              + New Enrollment
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-300">Search</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="doc number, attendance no, external name..."
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
                <option value="assigned">assigned</option>
                <option value="pending_hr_signature">
                  pending_hr_signature
                </option>
                <option value="signed">signed</option>
                <option value="cancelled">cancelled</option>
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
              Enrollments
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
                {items.map((e) => (
                  <Link
                    key={e._id}
                    to={`/fingerprints/enrollments/${e._id}`}
                    className="block p-4 hover:bg-slate-900/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{e.docNumber}</span>
                          <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                            {e.status}
                          </span>
                          <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                            {e.assigneeType}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          Attendance No:{" "}
                          <span className="text-slate-200">
                            {e.attendanceEmployeeNo}
                          </span>{" "}
                          • Assigned{" "}
                          {new Date(e.assignedAt).toLocaleDateString()}
                          {e.assigneeType === "external" &&
                          e.externalFullName ? (
                            <span className="text-slate-500">
                              {" "}
                              • {e.externalFullName}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        By {e.createdByUsername ?? "—"}
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
