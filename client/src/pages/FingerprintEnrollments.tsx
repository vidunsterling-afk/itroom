import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";
import {
  Fingerprint,
  Plus,
  Search,
  Filter,
  FileText,
  User,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  Badge,
  UserPlus,
} from "lucide-react";

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
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

      const data = await apiFetch<{
        items: Enrollment[];
        totalPages: number;
        total: number;
      }>(`/api/fingerprints/enrollments?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load enrollments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [query]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const clearFilters = () => {
    setQ("");
    setStatus("");
    setPage(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <UserPlus className="w-4 h-4" />;
      case "pending_hr_signature":
        return <Clock className="w-4 h-4" />;
      case "signed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Fingerprint className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "pending_hr_signature":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "signed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <Fingerprint className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Fingerprint Enrollments
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-indigo-400" />
                      Assign personnel to biometric devices with HR signature
                      workflow
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-800/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-slate-400 group-hover:text-slate-300 ${refreshing ? "animate-spin" : ""}`}
                  />
                  <span className="text-sm text-slate-300">Refresh</span>
                </button>
                <Link
                  to="/fingerprints/enrollments/new"
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all"
                >
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">
                    New Enrollment
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-medium text-white">
                    Filter Enrollments
                  </h2>
                </div>
                {(q || status) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Search */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Search className="w-3.5 h-3.5 mr-1" />
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      value={q}
                      onChange={(e) => {
                        setPage(1);
                        setQ(e.target.value);
                      }}
                      placeholder="Document number, attendance no, name..."
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Badge className="w-3.5 h-3.5 mr-1" />
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    value={status}
                    onChange={(e) => {
                      setPage(1);
                      setStatus(e.target.value);
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="assigned">Assigned</option>
                    <option value="pending_hr_signature">
                      Pending HR Signature
                    </option>
                    <option value="signed">Signed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {err && (
            <div className="mb-6 group relative overflow-hidden rounded-xl border border-red-800/50 bg-gradient-to-br from-red-950/30 to-slate-950/30 p-4">
              <div className="absolute inset-0 bg-red-500/5" />
              <div className="relative flex items-start space-x-3">
                <div className="p-1 bg-red-500/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-300">{err}</p>
                </div>
                <button
                  onClick={() => setErr(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}

          {/* Enrollments Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header with Pagination */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Enrollment Records
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300">
                    {totalItems} total
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">Prev</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-slate-300">Page</span>
                    <span className="text-sm font-medium text-white px-2 py-1 rounded bg-slate-800">
                      {page}
                    </span>
                    <span className="text-sm text-slate-300">of</span>
                    <span className="text-sm font-medium text-white">
                      {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400">
                    Loading enrollments...
                  </p>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Fingerprint className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No enrollments found
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {q || status
                    ? "Try adjusting your filters to see more results."
                    : "Get started by creating your first fingerprint enrollment."}
                </p>
                {(q || status) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Clear filters</span>
                  </button>
                )}
                {!q && !status && (
                  <Link
                    to="/fingerprints/enrollments/new"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Enrollment</span>
                  </Link>
                )}
              </div>
            ) : (
              /* Enrollments List */
              <div className="divide-y divide-slate-800">
                {items.map((e) => (
                  <Link
                    key={e._id}
                    to={`/fingerprints/enrollments/${e._id}`}
                    className="block p-6 hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Enrollment Info */}
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-slate-800/80 rounded-lg mt-1">
                            <FileText className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-medium text-white">
                                {e.docNumber}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${getStatusColor(e.status)}`}
                              >
                                {getStatusIcon(e.status)}
                                <span className="ml-1">
                                  {e.status.replace(/_/g, " ")}
                                </span>
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">
                                {e.assigneeType === "employee" ? (
                                  <Users className="w-3 h-3 mr-1" />
                                ) : (
                                  <User className="w-3 h-3 mr-1" />
                                )}
                                {e.assigneeType}
                              </span>
                            </div>

                            {/* Person Info */}
                            <div className="mt-2 flex items-center text-sm">
                              <User className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                              <span className="text-slate-400">Person:</span>
                              <span className="ml-1.5 text-slate-300">
                                {e.assigneeType === "employee"
                                  ? `Employee ID: ${e.employeeId}`
                                  : e.externalFullName || "External"}
                              </span>
                            </div>

                            {/* Attendance Number */}
                            <div className="mt-1 flex items-center text-sm">
                              <Badge className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                              <span className="text-slate-400">
                                Attendance No:
                              </span>
                              <span className="ml-1.5 text-slate-300 font-mono">
                                {e.attendanceEmployeeNo}
                              </span>
                            </div>

                            {/* Assigned Date */}
                            <div className="mt-2 flex items-center text-xs text-slate-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              Assigned{" "}
                              {new Date(e.assignedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Created By */}
                      <div className="lg:self-center flex items-center text-sm text-slate-500">
                        <User className="w-3.5 h-3.5 mr-1" />
                        By {e.createdByUsername || "system"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Card Footer */}
            {!loading && items.length > 0 && (
              <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4 text-slate-500">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                      Assigned
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-2" />
                      Pending HR
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                      Signed
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                      Cancelled
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Showing {items.length} of {totalItems} enrollments
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-indigo-400">
                  Enrollment Workflow:
                </span>{" "}
                Track the complete lifecycle from initial assignment to HR
                signature. Documents are automatically generated for signature.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
