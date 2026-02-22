// pages/AssetDetail.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import { AssignEmployeeModal } from "../components/AssignEmployeeModal";
import { ChangeStatusModal } from "../components/ChangeStatusModal";
import Layout from "../components/Layout";
import {
  Package,
  Edit,
  UserPlus,
  UserMinus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Tag,
  FileText,
  History,
  Wrench,
  Plus,
  ArrowLeft,
  Laptop,
  Server,
  Monitor,
  Printer,
  Wifi,
  HardDrive,
  Activity,
} from "lucide-react";

type RepairMini = {
  _id: string;
  vendorName: string;
  status: string;
  cost: number;
  reportedAt: string;
  isWarrantyClaim: boolean;
  warrantyExpiry?: string;
  issue: string;
};

type Asset = {
  _id: string;
  assetTag: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  serialNumber?: string;
  status: "active" | "in-repair" | "retired";
  notes?: string;
  currentAssignment?: null | {
    assigneeType: "employee" | "external";
    employeeId?: string;
    assigneeName: string;
    assignedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

type AssetEvent = {
  _id: string;
  type: "ASSIGN" | "UNASSIGN" | "STATUS_CHANGE" | "UPDATE_DETAILS";
  note?: string;
  actorUsername?: string;
  createdAt: string;
};

export default function AssetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const canWrite = user?.role === "admin";

  const [asset, setAsset] = useState<Asset | null>(null);
  const [events, setEvents] = useState<AssetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [repairs, setRepairs] = useState<RepairMini[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const a = await apiFetch<{ asset: Asset }>(`/api/assets/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const ev = await apiFetch<{ items: AssetEvent[] }>(
        `/api/assets/${id}/events?page=1&limit=25`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const rep = await apiFetch<{ items: RepairMini[] }>(
        `/api/repairs/asset/${id}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setAsset(a.asset);
      setEvents(ev.items);
      setRepairs(rep.items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load asset");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function unassign() {
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      await apiFetch(`/api/assets/${id}/unassign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      await loadAll();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unassign failed");
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "laptop":
        return <Laptop className="w-5 h-5" />;
      case "pc":
      case "server":
        return <Server className="w-5 h-5" />;
      case "monitor":
        return <Monitor className="w-5 h-5" />;
      case "printer":
        return <Printer className="w-5 h-5" />;
      case "router":
      case "switch":
        return <Wifi className="w-5 h-5" />;
      default:
        return <HardDrive className="w-5 h-5" />;
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

  const getEventIcon = (type: string) => {
    switch (type) {
      case "ASSIGN":
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      case "UNASSIGN":
        return <UserMinus className="w-4 h-4 text-orange-400" />;
      case "STATUS_CHANGE":
        return <Activity className="w-4 h-4 text-purple-400" />;
      case "UPDATE_DETAILS":
        return <Edit className="w-4 h-4 text-green-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Loading asset details...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (err || !asset) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="rounded-xl border border-red-800/50 bg-gradient-to-br from-red-950/30 to-slate-950/30 p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-red-300">
                    Error Loading Asset
                  </h3>
                  <p className="mt-1 text-sm text-red-200">
                    {err || "Asset not found"}
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/assets"
              className="inline-flex items-center mt-6 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Assets
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <div className="mb-6">
            <Link
              to="/assets"
              className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Assets
            </Link>
          </div>

          {/* Asset Header Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden mb-6">
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Asset Information
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
                      {getCategoryIcon(asset.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-white">
                          {asset.assetTag}
                        </h1>
                        <span className="text-lg text-slate-400">
                          {asset.brand} {asset.model}
                        </span>
                      </div>

                      <p className="mt-2 text-slate-300 text-lg">
                        {asset.name}
                      </p>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Tag className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Category:</span>
                            <span className="ml-2 text-slate-300 capitalize">
                              {asset.category}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <FileText className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Serial:</span>
                            <span className="ml-2 text-slate-300 font-mono">
                              {asset.serialNumber || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Added:</span>
                            <span className="ml-2 text-slate-300">
                              {new Date(asset.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Updated:</span>
                            <span className="ml-2 text-slate-300">
                              {new Date(asset.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Status & Actions */}
                <div className="lg:w-80 space-y-4">
                  {/* Status Badge */}
                  <div
                    className={`p-4 rounded-lg border ${getStatusColor(asset.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Current Status
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(asset.status)}`}
                      >
                        {asset.status === "active" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {asset.status === "in-repair" && (
                          <Wrench className="w-3 h-3 mr-1" />
                        )}
                        {asset.status === "retired" && (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {asset.status}
                      </span>
                    </div>
                  </div>

                  {/* Assignment Info */}
                  <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center mb-2">
                      <UserPlus className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm font-medium text-slate-300">
                        Current Assignment
                      </span>
                    </div>
                    <p className="text-lg font-medium text-white">
                      {asset.currentAssignment?.assigneeName || "Unassigned"}
                    </p>
                    {asset.currentAssignment?.assignedAt && (
                      <p className="text-xs text-slate-500 mt-1">
                        Since{" "}
                        {new Date(
                          asset.currentAssignment.assignedAt,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {canWrite && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setAssignOpen(true)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
                      >
                        <UserPlus className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">
                          Assign
                        </span>
                      </button>

                      <button
                        onClick={unassign}
                        disabled={!asset.currentAssignment}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span className="text-sm">Unassign</span>
                      </button>

                      <button
                        onClick={() => setStatusOpen(true)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all"
                      >
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">Change Status</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              {asset.notes && (
                <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center mb-2">
                    <FileText className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-sm font-medium text-slate-300">
                      Notes
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">
                    {asset.notes}
                  </p>
                </div>
              )}
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

          {/* Timeline Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden mb-6">
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">
                  Asset Timeline
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300">
                  Latest 25 events
                </span>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="p-12 text-center">
                <History className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No events recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {events.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-4 hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-slate-800 rounded-lg mt-0.5">
                        {getEventIcon(ev.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white">
                            {ev.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(ev.createdAt).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-400">
                            by {ev.actorUsername || "system"}
                          </span>
                        </div>
                        {ev.note && (
                          <p className="mt-1 text-sm text-slate-400">
                            {ev.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repairs Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Repair History
                  </h2>
                </div>
                {canWrite && (
                  <Link
                    to={`/repairs/new?assetId=${asset._id}`}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium text-amber-300">
                      New Repair
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {repairs.length === 0 ? (
              <div className="p-12 text-center">
                <Wrench className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  No repair records found
                </p>
                {canWrite && (
                  <Link
                    to={`/repairs/new?assetId=${asset._id}`}
                    className="inline-flex items-center space-x-2 mt-4 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Log First Repair</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {repairs.map((r) => (
                  <Link
                    key={r._id}
                    to={`/repairs/${r._id}`}
                    className="block p-4 hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white">
                            {r.vendorName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs ${
                              r.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : r.status === "in-progress"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {r.status}
                          </span>
                          {r.isWarrantyClaim && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs">
                              Warranty
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{r.issue}</p>
                        <div className="mt-1 flex items-center space-x-3 text-xs">
                          <span className="text-slate-500">
                            Cost:{" "}
                            <span className="text-slate-300">
                              ${r.cost?.toFixed(2) || "0.00"}
                            </span>
                          </span>
                          {r.warrantyExpiry && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-500">
                                Warranty until{" "}
                                {new Date(
                                  r.warrantyExpiry,
                                ).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(r.reportedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Modals */}
          {assignOpen && (
            <AssignEmployeeModal
              assetId={asset._id}
              onClose={() => setAssignOpen(false)}
              onDone={loadAll}
            />
          )}

          {statusOpen && (
            <ChangeStatusModal
              assetId={asset._id}
              onClose={() => setStatusOpen(false)}
              onDone={loadAll}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
