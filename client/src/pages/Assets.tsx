// pages/Assets.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";
import {
  Package,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Laptop,
  Server,
  Monitor,
  Printer,
  Wifi,
  HardDrive,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Box,
  Wrench,
} from "lucide-react";

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
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
        total: number;
        items: Asset[];
      }>(`/api/assets?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load assets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const clearFilters = () => {
    setQ("");
    setCategory("");
    setStatus("");
    setPage(1);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "laptop":
        return <Laptop className="w-4 h-4" />;
      case "pc":
      case "server":
        return <Server className="w-4 h-4" />;
      case "monitor":
        return <Monitor className="w-4 h-4" />;
      case "printer":
        return <Printer className="w-4 h-4" />;
      case "router":
      case "switch":
        return <Wifi className="w-4 h-4" />;
      default:
        return <HardDrive className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "in-repair":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "retired":
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
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
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Asset Inventory
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <Box className="w-4 h-4 mr-2 text-blue-400" />
                      Track and manage hardware assets across the organization
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
                    to="/assets/new"
                    className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">
                      New Asset
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
                  <Filter className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-medium text-white">
                    Filter Assets
                  </h2>
                </div>
                {(q || category || status) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Search Filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Search className="w-3.5 h-3.5 mr-1" />
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                      value={q}
                      onChange={(e) => {
                        setPage(1);
                        setQ(e.target.value);
                      }}
                      placeholder="Asset tag, name, serial..."
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <HardDrive className="w-3.5 h-3.5 mr-1" />
                    Category
                  </label>
                  <select
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-slate-200 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    value={category}
                    onChange={(e) => {
                      setPage(1);
                      setCategory(e.target.value);
                    }}
                  >
                    <option value="">All Categories</option>
                    <option value="laptop">Laptop</option>
                    <option value="pc">PC</option>
                    <option value="server">Server</option>
                    <option value="monitor">Monitor</option>
                    <option value="printer">Printer</option>
                    <option value="router">Router</option>
                    <option value="switch">Switch</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-slate-200 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    value={status}
                    onChange={(e) => {
                      setPage(1);
                      setStatus(e.target.value);
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="in-repair">In Repair</option>
                    <option value="retired">Retired</option>
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

          {/* Assets Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header with Pagination */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Asset Inventory
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
                    <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400">Loading assets...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No assets found
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {q || category || status
                    ? "Try adjusting your filters to see more results."
                    : "Get started by adding your first asset to the inventory."}
                </p>
                {(q || category || status) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Clear filters</span>
                  </button>
                )}
                {!q && !category && !status && canWrite && (
                  <Link
                    to="/assets/new"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Asset</span>
                  </Link>
                )}
              </div>
            ) : (
              /* Assets List */
              <div className="divide-y divide-slate-800">
                {items.map((a) => (
                  <Link
                    key={a._id}
                    to={`/assets/${a._id}`}
                    className="block p-6 hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Asset Info */}
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-slate-800/80 rounded-lg mt-1">
                            {getCategoryIcon(a.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-medium text-white">
                                {a.assetTag}
                              </h3>
                              <span className="text-sm text-slate-400">
                                {a.brand} {a.model}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">
                                {getCategoryIcon(a.category)}
                                <span className="ml-1">{a.category}</span>
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${getStatusColor(a.status)}`}
                              >
                                {a.status === "active" && (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                {a.status === "in-repair" && (
                                  <Wrench className="w-3 h-3 mr-1" />
                                )}
                                {a.status === "retired" && (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {a.status}
                              </span>
                            </div>

                            {/* Asset Details */}
                            <p className="mt-1 text-sm text-slate-300">
                              {a.name}
                              {a.serialNumber && (
                                <span className="text-slate-500 ml-2">
                                  • SN:{" "}
                                  <span className="font-mono">
                                    {a.serialNumber}
                                  </span>
                                </span>
                              )}
                            </p>

                            {/* Assignment Info */}
                            <div className="mt-2 flex items-center text-sm">
                              <User className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                              <span className="text-slate-400">
                                Assigned to:
                              </span>
                              <span className="ml-1.5 text-slate-300">
                                {a.currentAssignment?.assigneeName ?? "—"}
                              </span>
                              {a.currentAssignment?.assignedAt && (
                                <span className="text-slate-500 ml-2 text-xs">
                                  since{" "}
                                  {new Date(
                                    a.currentAssignment.assignedAt,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Created Date */}
                            <div className="mt-2 flex items-center text-xs text-slate-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              Added{" "}
                              {new Date(a.createdAt).toLocaleDateString(
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

                      {/* Last Updated */}
                      <div className="lg:self-center flex items-center text-sm text-slate-500">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        Updated {new Date(a.updatedAt).toLocaleDateString()}
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
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                      Active
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-2" />
                      In Repair
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full mr-2" />
                      Retired
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Showing {items.length} of {totalItems} assets
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-blue-400">
                  Asset Management:
                </span>{" "}
                Track hardware lifecycle, assignments, and maintenance history.
                {canWrite
                  ? " You have admin access to create and edit assets."
                  : " You have read-only access to view asset information."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
