import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";
import {
  Key,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  XCircle,
  Clock,
  Building2,
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
  Info,
  Tag,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

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
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

      const data = await apiFetch<{
        items: License[];
        totalPages: number;
        total: number;
      }>(`/api/licenses?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load licenses");
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
    setVendor("");
    setType("");
    setExpiringInDays("");
    setPage(1);
  };

  const getTypeIcon = (type: string) => {
    return type === "subscription" ? (
      <Clock className="w-4 h-4" />
    ) : (
      <DollarSign className="w-4 h-4" />
    );
  };

  const getSeatUtilizationColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 70) return "text-amber-400";
    return "text-emerald-400";
  };

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const days = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
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
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Key className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      License Management
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-purple-400" />
                      Track software licenses, subscriptions, and seat
                      allocations
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
                    to="/licenses/new"
                    className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">
                      New License
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
                  <Filter className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-medium text-white">
                    Filter Licenses
                  </h2>
                </div>
                {(q || vendor || type || expiringInDays) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
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
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      value={q}
                      onChange={(e) => {
                        setPage(1);
                        setQ(e.target.value);
                      }}
                      placeholder="License key, name, vendor..."
                    />
                  </div>
                </div>

                {/* Vendor */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Building2 className="w-3.5 h-3.5 mr-1" />
                    Vendor
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      value={vendor}
                      onChange={(e) => {
                        setPage(1);
                        setVendor(e.target.value);
                      }}
                      placeholder="Microsoft, Adobe..."
                    />
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Tag className="w-3.5 h-3.5 mr-1" />
                    Type
                  </label>
                  <select
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-slate-200 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                    value={type}
                    onChange={(e) => {
                      setPage(1);
                      setType(e.target.value as Types);
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="subscription">Subscription</option>
                    <option value="perpetual">Perpetual</option>
                  </select>
                </div>

                {/* Expiring In */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Expiring in (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                    value={expiringInDays}
                    onChange={(e) => {
                      setPage(1);
                      setExpiringInDays(e.target.value);
                    }}
                    placeholder="30"
                  />
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

          {/* Licenses Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header with Pagination */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">
                    License Inventory
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
                    <div className="w-12 h-12 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400">Loading licenses...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Key className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No licenses found
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {q || vendor || type || expiringInDays
                    ? "Try adjusting your filters to see more results."
                    : "Get started by adding your first software license."}
                </p>
                {(q || vendor || type || expiringInDays) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Clear filters</span>
                  </button>
                )}
                {!q && !vendor && !type && !expiringInDays && canWrite && (
                  <Link
                    to="/licenses/new"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add License</span>
                  </Link>
                )}
              </div>
            ) : (
              /* Licenses List */
              <div className="divide-y divide-slate-800">
                {items.map((l) => {
                  const remaining = Math.max(0, l.seatsTotal - l.seatsUsed);
                  const daysUntilExpiry = getDaysUntilExpiry(l.expiresAt);
                  const expSoon =
                    daysUntilExpiry !== null && daysUntilExpiry <= 30;
                  const utilizationColor = getSeatUtilizationColor(
                    l.seatsUsed,
                    l.seatsTotal,
                  );

                  return (
                    <Link
                      key={l._id}
                      to={`/licenses/${l._id}`}
                      className="block p-6 hover:bg-slate-900/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* License Info */}
                        <div className="flex-1">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-slate-800/80 rounded-lg mt-1">
                              <Key className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-medium text-white">
                                  {l.key}
                                </h3>
                                <span className="text-sm text-slate-400">
                                  {l.name}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {l.vendor}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">
                                  {getTypeIcon(l.type)}
                                  <span className="ml-1">{l.type}</span>
                                </span>
                                {!l.isActive && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/10 text-xs text-red-400 border border-red-500/30">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    inactive
                                  </span>
                                )}
                                {expSoon && l.isActive && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-xs text-amber-400 border border-amber-500/30">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    expiring in {daysUntilExpiry} days
                                  </span>
                                )}
                              </div>

                              {/* Seat Usage */}
                              <div className="mt-3">
                                <div className="flex items-center text-sm">
                                  <Users className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                                  <span className="text-slate-400">
                                    Seat utilization:
                                  </span>
                                  <span
                                    className={`ml-2 font-medium ${utilizationColor}`}
                                  >
                                    {l.seatsUsed} / {l.seatsTotal}
                                  </span>
                                  <span className="ml-2 text-xs text-slate-500">
                                    ({remaining} remaining)
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-2 w-full max-w-md h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      l.seatsUsed / l.seatsTotal >= 0.9
                                        ? "bg-red-500"
                                        : l.seatsUsed / l.seatsTotal >= 0.7
                                          ? "bg-amber-500"
                                          : "bg-emerald-500"
                                    }`}
                                    style={{
                                      width: `${(l.seatsUsed / l.seatsTotal) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Expiry Info */}
                              {l.expiresAt && (
                                <div className="mt-2 flex items-center text-xs">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                                  <span className="text-slate-400">
                                    Expires:
                                  </span>
                                  <span
                                    className={`ml-1.5 ${expSoon ? "text-amber-400" : "text-slate-300"}`}
                                  >
                                    {new Date(l.expiresAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Last Updated */}
                        <div className="lg:self-center flex items-center text-sm text-slate-500">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Updated {new Date(l.updatedAt).toLocaleDateString()}
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
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                      Active
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-2" />
                      Expiring Soon
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                      Inactive
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Showing {items.length} of {totalItems} licenses
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-purple-400">
                  License Management:
                </span>{" "}
                Track software licenses, monitor seat utilization, and get
                alerts for upcoming expirations.
                {canWrite
                  ? " You have admin access to create and manage licenses."
                  : " You have read-only access to view license information."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
