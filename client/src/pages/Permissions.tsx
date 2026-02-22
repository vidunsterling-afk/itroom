import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";
import {
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  Lock,
  Users,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  AlertCircle,
  Key,
  Info,
} from "lucide-react";

type Row = {
  moduleKey: string;
  moduleName: string;
  availableActions: string[];
  staffActions: string[];
};

export default function Permissions() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ items: Row[] }>("/api/permissions/staff", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setRows(data.items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load permissions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(moduleKey: string, action: string) {
    setErr(null);
    setMsg(null);

    const current = rows.find((r) => r.moduleKey === moduleKey);
    if (!current) return;

    const has = current.staffActions.includes(action);
    const next = has
      ? current.staffActions.filter((a) => a !== action)
      : [...current.staffActions, action];

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      await apiFetch("/api/permissions/staff", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ moduleKey, actions: next }),
      });

      setRows((prev) =>
        prev.map((r) =>
          r.moduleKey === moduleKey ? { ...r, staffActions: next } : r,
        ),
      );
      setMsg(`Staff permissions updated for ${current.moduleName}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to update permissions");
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "view":
      case "read":
        return <Eye className="w-3 h-3 mr-1" />;
      case "create":
      case "add":
        return <Plus className="w-3 h-3 mr-1" />;
      case "edit":
      case "update":
        return <Edit className="w-3 h-3 mr-1" />;
      case "delete":
      case "remove":
        return <Trash2 className="w-3 h-3 mr-1" />;
      case "export":
      case "download":
        return <Download className="w-3 h-3 mr-1" />;
      default:
        return <Key className="w-3 h-3 mr-1" />;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    load();
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
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Staff Permissions
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-amber-400" />
                      Configure module access for staff roles. Auditors maintain
                      read-only access globally.
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
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {msg && (
            <div className="mb-6 group relative overflow-hidden rounded-xl border border-emerald-800/50 bg-gradient-to-br from-emerald-950/30 to-slate-950/30 p-4">
              <div className="absolute inset-0 bg-emerald-500/5" />
              <div className="relative flex items-start space-x-3">
                <div className="p-1 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-300">{msg}</p>
                </div>
                <button
                  onClick={() => setMsg(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}

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

          {/* Permissions Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Module Permissions Matrix
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  {rows.length} modules configured
                </span>
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
                    Loading permissions...
                  </p>
                </div>
              </div>
            ) : (
              /* Modules List */
              <div className="divide-y divide-slate-800">
                {rows.map((r) => (
                  <div
                    key={r.moduleKey}
                    className="p-6 hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Module Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-slate-800/80 rounded-lg">
                            <Shield className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-white">
                              {r.moduleName}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              {r.moduleKey}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions Grid */}
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 justify-end">
                          {r.availableActions.map((a) => {
                            const isEnabled = r.staffActions.includes(a);
                            return (
                              <button
                                key={a}
                                onClick={() => toggle(r.moduleKey, a)}
                                className={`group relative inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                  isEnabled
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                                    : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-slate-300 hover:border-slate-600"
                                }`}
                              >
                                {getActionIcon(a)}
                                {a}
                                {isEnabled && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Permission Summary */}
                    <div className="mt-3 flex items-center space-x-2 text-xs text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-800/50 rounded-full">
                        {r.staffActions.length} of {r.availableActions.length}{" "}
                        actions enabled
                      </span>
                      {r.staffActions.length === 0 && (
                        <span className="text-amber-500/70 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          No staff access
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {rows.length === 0 && !loading && (
                  <div className="p-12 text-center">
                    <div className="p-3 bg-slate-800/50 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      No modules found
                    </h3>
                    <p className="text-sm text-slate-400">
                      No permission configurations are available.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Card Footer */}
            <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4 text-slate-500">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                    Enabled actions
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-slate-600 rounded-full mr-2" />
                    Available actions
                  </span>
                </div>
                <div className="text-slate-600">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-blue-400">Note:</span> Changes
                to staff permissions take effect immediately. Auditor role
                maintains read-only access across all modules regardless of
                these settings.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
