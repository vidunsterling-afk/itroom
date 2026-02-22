import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import { AssignLicenseModal } from "../components/AssignLicenseModal";
import Layout from "../components/Layout";

type License = {
  _id: string;
  key: string;
  name: string;
  vendor: string;
  type: "subscription" | "perpetual";
  seatsTotal: number;
  seatsUsed: number;
  expiresAt?: string;
  renewalAt?: string;
  notes?: string;
  isActive: boolean;
  updatedAt: string;
};

type Assignment = {
  _id: string;
  employeeId: string; // ObjectId
  seatCount: number;
  assignedAt: string;
  unassignedAt?: string | null;
  note?: string;
};

export default function LicenseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const canWrite = user?.role === "admin";

  const [license, setLicense] = useState<License | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const l = await apiFetch<{ license: License }>(`/api/licenses/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const a = await apiFetch<{ items: Assignment[] }>(
        `/api/licenses/${id}/assignments`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setLicense(l.license);
      setAssignments(a.items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(); /* eslint-disable-next-line */
  }, [id]);

  async function unassign(employeeId: string) {
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      await apiFetch(`/api/licenses/${id}/unassign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeeId }),
      });

      await loadAll();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unassign failed");
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        Loading...
      </div>
    );

  if (err)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-200">
            {err}
          </div>
          <Link
            to="/licenses"
            className="inline-block mt-4 text-slate-300 hover:underline"
          >
            ← Back to Licenses
          </Link>
        </div>
      </div>
    );

  if (!license) return null;

  const remaining = Math.max(0, license.seatsTotal - license.seatsUsed);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/licenses" className="text-slate-300 hover:underline">
            ← Back to Licenses
          </Link>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold">{license.key}</h1>
                  <span className="text-slate-300">{license.name}</span>
                  <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                    {license.vendor}
                  </span>
                  <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                    {license.type}
                  </span>
                  {!license.isActive && (
                    <span className="text-xs rounded-lg border border-red-900 px-2 py-1 text-red-200 bg-red-950/20">
                      inactive
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm text-slate-400">
                  Seats:{" "}
                  <span className="text-slate-200">{license.seatsUsed}</span> /{" "}
                  <span className="text-slate-200">{license.seatsTotal}</span>{" "}
                  <span className="text-slate-500">
                    (remaining {remaining})
                  </span>
                </div>

                <div className="mt-2 text-sm text-slate-400">
                  Expires:{" "}
                  <span className="text-slate-200">
                    {license.expiresAt
                      ? new Date(license.expiresAt).toLocaleDateString()
                      : "—"}
                  </span>{" "}
                  • Renewal:{" "}
                  <span className="text-slate-200">
                    {license.renewalAt
                      ? new Date(license.renewalAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                {license.notes && (
                  <div className="mt-3 text-sm text-slate-300">
                    {license.notes}
                  </div>
                )}
              </div>

              {canWrite && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAssignOpen(true)}
                    className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
              Assignments (latest 100)
            </div>

            {assignments.length === 0 ? (
              <div className="p-4 text-slate-400">No assignments yet</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {assignments.map((a) => {
                  const active = !a.unassignedAt;
                  return (
                    <div key={a._id} className="p-4 hover:bg-slate-900/30">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-200 font-medium">
                              EmployeeId: {a.employeeId}
                            </span>
                            <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                              seats {a.seatCount}
                            </span>
                            <span
                              className={`text-xs rounded-lg border px-2 py-1 ${
                                active
                                  ? "border-emerald-900 text-emerald-200 bg-emerald-950/20"
                                  : "border-slate-800 text-slate-400 bg-slate-950"
                              }`}
                            >
                              {active ? "active" : "ended"}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Assigned {new Date(a.assignedAt).toLocaleString()}
                            {a.unassignedAt
                              ? ` • Unassigned ${new Date(a.unassignedAt).toLocaleString()}`
                              : ""}
                          </div>
                          {a.note && (
                            <div className="mt-1 text-sm text-slate-300">
                              {a.note}
                            </div>
                          )}
                        </div>

                        {canWrite && active && (
                          <button
                            onClick={() => unassign(a.employeeId)}
                            className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
                          >
                            Unassign
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {assignOpen && (
            <AssignLicenseModal
              licenseId={license._id}
              onClose={() => setAssignOpen(false)}
              onDone={loadAll}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
