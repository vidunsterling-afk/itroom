import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import { AssignLicenseModal } from "../components/AssignLicenseModal";
import Layout from "../components/Layout";
import {
  Key,
  UserPlus,
  UserMinus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Building2,
  Users,
  FileText,
  History,
  ArrowLeft,
  Tag,
  AlertTriangle,
} from "lucide-react";

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
  employeeId: string;
  employeeName?: string;
  employeeEmail?: string;
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
  const [refreshing, setRefreshing] = useState(false);
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
      setErr(e instanceof Error ? e.message : "Failed to load license details");
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      setErr(e instanceof Error ? e.message : "Failed to unassign");
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const days = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return days;
  };

  const getSeatUtilizationColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 70) return "text-amber-400";
    return "text-emerald-400";
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Loading license details...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (err || !license) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="rounded-xl border border-red-800/50 bg-gradient-to-br from-red-950/30 to-slate-950/30 p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-red-300">
                    Error Loading License
                  </h3>
                  <p className="mt-1 text-sm text-red-200">
                    {err || "License not found"}
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/licenses"
              className="inline-flex items-center mt-6 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Licenses
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const remaining = Math.max(0, license.seatsTotal - license.seatsUsed);
  const daysUntilExpiry = getDaysUntilExpiry(license.expiresAt);
  const expSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30;
  const utilizationColor = getSeatUtilizationColor(
    license.seatsUsed,
    license.seatsTotal,
  );

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <div className="mb-6">
            <Link
              to="/licenses"
              className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Licenses
            </Link>
          </div>

          {/* License Header Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden mb-6">
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">
                    License Information
                  </h2>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  <span className="text-sm">Refresh</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Left Column - Main Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-slate-800/80 rounded-xl">
                      <Key className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-white">
                          {license.key}
                        </h1>
                        <span className="text-lg text-slate-400">
                          {license.name}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Building2 className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Vendor:</span>
                            <span className="ml-2 text-slate-300">
                              {license.vendor}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Tag className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Type:</span>
                            <span className="ml-2 text-slate-300 capitalize">
                              {license.type}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Expires:</span>
                            <span
                              className={`ml-2 ${expSoon ? "text-amber-400" : "text-slate-300"}`}
                            >
                              {license.expiresAt
                                ? new Date(
                                    license.expiresAt,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Users className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Seats:</span>
                            <span
                              className={`ml-2 font-medium ${utilizationColor}`}
                            >
                              {license.seatsUsed} / {license.seatsTotal}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Renewal:</span>
                            <span className="ml-2 text-slate-300">
                              {license.renewalAt
                                ? new Date(
                                    license.renewalAt,
                                  ).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <History className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Updated:</span>
                            <span className="ml-2 text-slate-300">
                              {new Date(license.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {license.notes && (
                    <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="flex items-center mb-2">
                        <FileText className="w-4 h-4 text-slate-500 mr-2" />
                        <span className="text-sm font-medium text-slate-300">
                          Notes
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 whitespace-pre-wrap">
                        {license.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - Status & Actions */}
                <div className="lg:w-80 space-y-4">
                  {/* Status Badge */}
                  <div
                    className={`p-4 rounded-lg border ${
                      license.isActive
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-red-500/5 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">
                        Status
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          license.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {license.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Seat Utilization */}
                  <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">
                        Seat Utilization
                      </span>
                      <span
                        className={`text-sm font-medium ${utilizationColor}`}
                      >
                        {Math.round(
                          (license.seatsUsed / license.seatsTotal) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          license.seatsUsed / license.seatsTotal >= 0.9
                            ? "bg-red-500"
                            : license.seatsUsed / license.seatsTotal >= 0.7
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${(license.seatsUsed / license.seatsTotal) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {remaining} seats remaining
                    </p>
                  </div>

                  {/* Expiry Alert */}
                  {expSoon && license.isActive && (
                    <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/30">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-300">
                            Expiring Soon
                          </p>
                          <p className="text-xs text-amber-400/80 mt-1">
                            This license expires in {daysUntilExpiry} days
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {canWrite && (
                    <button
                      onClick={() => setAssignOpen(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                    >
                      <UserPlus className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">
                        Assign License
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {err && (
            <div className="mb-6 rounded-xl border border-red-800/50 bg-gradient-to-br from-red-950/30 to-slate-950/30 p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{err}</p>
              </div>
            </div>
          )}

          {/* Assignments Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">
                  License Assignments
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300">
                  {assignments.length} total
                </span>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No assignments yet</p>
                {canWrite && (
                  <button
                    onClick={() => setAssignOpen(true)}
                    className="inline-flex items-center space-x-2 mt-4 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm">Assign License</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {assignments.map((a) => {
                  const active = !a.unassignedAt;
                  return (
                    <div
                      key={a._id}
                      className="p-4 hover:bg-slate-900/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-white">
                              {a.employeeName || `Employee ID: ${a.employeeId}`}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">
                              <Users className="w-3 h-3 mr-1" />
                              {a.seatCount}{" "}
                              {a.seatCount === 1 ? "seat" : "seats"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${
                                active
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                              }`}
                            >
                              {active ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  ended
                                </>
                              )}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            <span className="flex items-center text-slate-500">
                              <Clock className="w-3 h-3 mr-1" />
                              Assigned:{" "}
                              {new Date(a.assignedAt).toLocaleString()}
                            </span>
                            {a.unassignedAt && (
                              <span className="flex items-center text-slate-500">
                                <Clock className="w-3 h-3 mr-1" />
                                Unassigned:{" "}
                                {new Date(a.unassignedAt).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {a.note && (
                            <p className="mt-2 text-sm text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800">
                              {a.note}
                            </p>
                          )}
                        </div>

                        {canWrite && active && (
                          <button
                            onClick={() => unassign(a.employeeId)}
                            className="flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all text-sm"
                          >
                            <UserMinus className="w-4 h-4" />
                            <span>Unassign</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modals */}
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
