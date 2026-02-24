import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";
import {
  Wrench,
  RefreshCw,
  Plus,
  Search,
  Filter,
  AlertCircle,
  XCircle,
  Calendar,
  DollarSign,
  Shield,
  Truck,
  Settings,
  CheckSquare,
  XSquare,
  ChevronLeft,
  ChevronRight,
  Info,
  Package,
  AlertTriangle,
} from "lucide-react";

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
  const canWrite = user?.role === "admin";

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [warrantyOnly, setWarrantyOnly] = useState(false);
  const [expiringInDays, setExpiringInDays] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Repair[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

      const data = await apiFetch<{
        items: Repair[];
        totalPages: number;
        total: number;
      }>(`/api/repairs?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load repairs");
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
    setWarrantyOnly(false);
    setExpiringInDays("");
    setPage(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reported":
        return <AlertCircle className="w-4 h-4" />;
      case "sent":
        return <Truck className="w-4 h-4" />;
      case "repairing":
        return <Settings className="w-4 h-4" />;
      case "returned":
        return <Package className="w-4 h-4" />;
      case "closed":
        return <CheckSquare className="w-4 h-4" />;
      case "cancelled":
        return <XSquare className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "sent":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "repairing":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "returned":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "closed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getDaysUntilWarrantyExpiry = (expiry?: string) => {
    if (!expiry) return null;
    const days = Math.ceil(
      (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return days;
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
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Wrench className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Repair Management
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-amber-400" />
                      Track service requests, repairs, and warranty claims
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
                {canWrite && (
                  <Link
                    to="/repairs/new"
                    className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">
                      New Repair
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-medium text-white">
                    Filter Repairs
                  </h2>
                </div>
                {(q || status || warrantyOnly || expiringInDays) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
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
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                      value={q}
                      onChange={(e) => {
                        setPage(1);
                        setQ(e.target.value);
                      }}
                      placeholder="Vendor, issue, resolution, notes..."
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Settings className="w-3.5 h-3.5 mr-1" />
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                    value={status}
                    onChange={(e) => {
                      setPage(1);
                      setStatus(e.target.value);
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="reported">Reported</option>
                    <option value="sent">Sent to Vendor</option>
                    <option value="repairing">In Repair</option>
                    <option value="returned">Returned</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Warranty Expiry */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Warranty expiring in
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                    value={expiringInDays}
                    onChange={(e) => {
                      setPage(1);
                      setExpiringInDays(e.target.value);
                    }}
                    placeholder="30 days"
                  />
                </div>
              </div>

              {/* Warranty Checkbox */}
              <div className="mt-4 flex items-center">
                <label className="flex items-center space-x-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={warrantyOnly}
                    onChange={(e) => {
                      setPage(1);
                      setWarrantyOnly(e.target.checked);
                    }}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/50 focus:ring-offset-0"
                  />
                  <span>Show only warranty claims</span>
                </label>
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

          {/* Repairs Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header with Pagination */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Repair Records
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
                    <div className="w-12 h-12 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400">Loading repairs...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No repairs found
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {q || status || warrantyOnly || expiringInDays
                    ? "Try adjusting your filters to see more results."
                    : "Get started by logging your first repair record."}
                </p>
                {(q || status || warrantyOnly || expiringInDays) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Clear filters</span>
                  </button>
                )}
                {!q &&
                  !status &&
                  !warrantyOnly &&
                  !expiringInDays &&
                  canWrite && (
                    <Link
                      to="/repairs/new"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Log Repair</span>
                    </Link>
                  )}
              </div>
            ) : (
              /* Repairs List */
              <div className="divide-y divide-slate-800">
                {items.map((r) => {
                  const daysUntilWarrantyExpiry = getDaysUntilWarrantyExpiry(
                    r.warrantyExpiry,
                  );
                  const warrantyExpiringSoon =
                    daysUntilWarrantyExpiry !== null &&
                    daysUntilWarrantyExpiry <= 30;

                  return (
                    <Link
                      key={r._id}
                      to={`/repairs/${r._id}`}
                      className="block p-6 hover:bg-slate-900/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Repair Info */}
                        <div className="flex-1">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-slate-800/80 rounded-lg mt-1">
                              {getStatusIcon(r.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-medium text-white">
                                  {r.vendorName}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${getStatusColor(r.status)}`}
                                >
                                  {getStatusIcon(r.status)}
                                  <span className="ml-1">{r.status}</span>
                                </span>
                                {r.isWarrantyClaim && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    warranty
                                  </span>
                                )}
                                {warrantyExpiringSoon && r.isWarrantyClaim && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    warranty expiring in{" "}
                                    {daysUntilWarrantyExpiry} days
                                  </span>
                                )}
                              </div>

                              {/* Issue Summary */}
                              <p className="mt-2 text-sm text-slate-300 line-clamp-2">
                                {r.issue}
                              </p>

                              {/* Metadata */}
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                <span className="flex items-center text-slate-500">
                                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                                  Cost:{" "}
                                  <span className="text-slate-300 ml-1">
                                    ${r.cost?.toFixed(2) || "0.00"}
                                  </span>
                                </span>
                                <span className="flex items-center text-slate-500">
                                  <Calendar className="w-3.5 h-3.5 mr-1" />
                                  Reported:{" "}
                                  {new Date(r.reportedAt).toLocaleDateString()}
                                </span>
                                {r.warrantyExpiry && (
                                  <span className="flex items-center text-slate-500">
                                    <Shield className="w-3.5 h-3.5 mr-1" />
                                    Warranty until:{" "}
                                    {new Date(
                                      r.warrantyExpiry,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Asset Link */}
                        <div className="lg:self-center flex items-center text-sm text-slate-500">
                          <Package className="w-3.5 h-3.5 mr-1" />
                          Asset: {r.assetId.substring(0, 8)}...
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Card Footer */}
            {!loading && items.length > 0 && (
              <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4 text-slate-500">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                      Reported
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                      Sent
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-2" />
                      Repairing
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                      Returned
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                      Closed
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                      Cancelled
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Showing {items.length} of {totalItems} repairs
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-amber-400">
                  Repair Tracking:
                </span>{" "}
                Monitor the complete lifecycle of equipment repairs, track
                costs, and manage warranty claims.
                {canWrite
                  ? " You have admin access to create and manage repair records."
                  : " You have read-only access to view repair information."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
