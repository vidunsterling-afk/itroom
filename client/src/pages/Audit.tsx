// pages/Audit.tsx
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";
import {
  History,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Globe,
  Clock,
  FileText,
  Calendar,
  Download,
  RefreshCw,
  Info,
  Shield,
  Activity,
  Server,
  Monitor,
  Fingerprint,
} from "lucide-react";

type Status = "SUCCESS" | "FAIL";
type AuditItem = {
  _id: string;
  actorUsername?: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  status: "SUCCESS" | "FAIL";
  ip?: string;
  userAgent?: string;
  createdAt: string;
};

export default function Audit() {
  const [module, setModule] = useState("");
  const [actor, setActor] = useState("");
  const [status, setStatus] = useState<"" | "SUCCESS" | "FAIL">("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<AuditItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (module.trim()) p.set("module", module.trim());
    if (actor.trim()) p.set("actor", actor.trim());
    if (status) p.set("status", status);
    p.set("page", String(page));
    p.set("limit", "25");
    return p.toString();
  }, [module, actor, status, page]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const token = getAccessToken();
        if (!token) throw new Error("No access token. Please login again.");

        const data = await apiFetch<{
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          items: AuditItem[];
        }>(`/api/audit?${query}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        setItems(data.items);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to load audit logs");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    })();
  }, [query]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    // The useEffect will trigger with page=1
  };

  const clearFilters = () => {
    setModule("");
    setActor("");
    setStatus("");
    setPage(1);
  };

  const getModuleIcon = (moduleName: string) => {
    switch (moduleName.toLowerCase()) {
      case "auth":
        return <Shield className="w-4 h-4" />;
      case "users":
        return <User className="w-4 h-4" />;
      case "assets":
        return <Server className="w-4 h-4" />;
      case "licenses":
        return <FileText className="w-4 h-4" />;
      case "audit":
        return <History className="w-4 h-4" />;
      case "fingerprint":
        return <Fingerprint className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
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
                    <History className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Audit Trail
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-blue-400" />
                      Comprehensive event tracking and compliance monitoring
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
                <button
                  onClick={() => {
                    /* Export functionality */
                  }}
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-800/80 transition-all"
                >
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                  <span className="text-sm text-slate-300">Export</span>
                </button>
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
                    Filter Audit Logs
                  </h2>
                </div>
                {(module || actor || status) && (
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
              <div className="grid gap-4 md:grid-cols-4">
                {/* Module Filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Server className="w-3.5 h-3.5 mr-1" />
                    Module
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                      value={module}
                      onChange={(e) => {
                        setPage(1);
                        setModule(e.target.value);
                      }}
                      placeholder="auth, users, assets..."
                    />
                  </div>
                </div>

                {/* Actor Filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <User className="w-3.5 h-3.5 mr-1" />
                    Actor
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                      value={actor}
                      onChange={(e) => {
                        setPage(1);
                        setActor(e.target.value);
                      }}
                      placeholder="username"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Activity className="w-3.5 h-3.5 mr-1" />
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    value={status}
                    onChange={(e) => {
                      setPage(1);
                      setStatus(e.target.value as Status);
                    }}
                  >
                    <option value="">All Events</option>
                    <option value="SUCCESS">Success Only</option>
                    <option value="FAIL">Failed Only</option>
                  </select>
                </div>

                {/* Results Summary */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Results
                  </label>
                  <div className="h-[38px] flex items-center px-3 rounded-lg bg-slate-950 border border-slate-800 text-sm">
                    <span className="text-slate-300">{totalItems} events</span>
                  </div>
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

          {/* Audit Logs Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header with Pagination */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Event Timeline
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300">
                    Latest first
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
                  <p className="text-sm text-slate-400">
                    Loading audit logs...
                  </p>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <History className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No audit events found
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {module || actor || status
                    ? "Try adjusting your filters to see more results."
                    : "Audit logs will appear here as system events occur."}
                </p>
                {(module || actor || status) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Clear filters</span>
                  </button>
                )}
              </div>
            ) : (
              /* Audit Logs List */
              <div className="divide-y divide-slate-800">
                {items.map((it) => (
                  <div
                    key={it._id}
                    className="p-6 hover:bg-slate-900/30 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Module Badge */}
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-800 border border-slate-700">
                        {getModuleIcon(it.module)}
                        <span className="text-xs font-medium text-slate-300 ml-1">
                          {it.module}
                        </span>
                      </span>

                      {/* Action */}
                      <span className="text-sm font-medium text-white">
                        {it.action}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          it.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {it.status === "SUCCESS" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {it.status}
                      </span>

                      {/* Timestamp */}
                      <span className="flex items-center text-xs text-slate-500 ml-auto">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(it.createdAt)}
                      </span>
                    </div>

                    {/* Actor Info */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center text-slate-400">
                        <User className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        Actor:{" "}
                        <span className="ml-1 text-slate-300 font-medium">
                          {it.actorUsername ?? "system"}
                        </span>
                      </span>

                      {it.entityId && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center text-slate-400">
                            <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                            Entity:{" "}
                            <span className="ml-1 text-slate-300">
                              {it.entityType ?? "unknown"}:{it.entityId}
                            </span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Summary */}
                    {it.summary && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                        <p className="text-sm text-slate-300">{it.summary}</p>
                      </div>
                    )}

                    {/* Metadata Footer */}
                    {(it.ip || it.userAgent) && (
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {it.ip && (
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            IP: {it.ip}
                          </span>
                        )}
                        {it.userAgent && (
                          <span className="flex items-center">
                            <Monitor className="w-3 h-3 mr-1" />
                            {it.userAgent.length > 50
                              ? `${it.userAgent.substring(0, 50)}...`
                              : it.userAgent}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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
                      Success
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                      Failed
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Showing {items.length} of {totalItems} events
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compliance Note */}
          <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-blue-400">
                  Compliance Note:
                </span>{" "}
                Audit logs are retained for 90 days in accordance with security
                policy. All events are immutable and cryptographically signed to
                ensure integrity.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
