import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";
import {
  Wrench,
  Edit,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Shield,
  Building2,
  FileText,
  Package,
  ArrowLeft,
  Truck,
  Settings,
  CheckSquare,
  XSquare,
  AlertTriangle,
} from "lucide-react";

type Repair = {
  _id: string;
  assetId: string;
  vendorName: string;
  cost: number;
  status: string;
  reportedAt: string;
  sentAt?: string;
  returnedAt?: string;
  closedAt?: string;
  issue: string;
  resolution?: string;
  isWarrantyClaim: boolean;
  warrantyExpiry?: string;
  warrantyProvider?: string;
  notes?: string;
  createdAt: string;
};

export default function RepairDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const canWrite = user?.role === "admin";

  const [repair, setRepair] = useState<Repair | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setErr(null);
    setRefreshing(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ repair: Repair }>(`/api/repairs/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setRepair(data.repair);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load repair details");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reported":
        return <AlertCircle className="w-5 h-5" />;
      case "sent":
        return <Truck className="w-5 h-5" />;
      case "repairing":
        return <Settings className="w-5 h-5" />;
      case "returned":
        return <Package className="w-5 h-5" />;
      case "closed":
        return <CheckSquare className="w-5 h-5" />;
      case "cancelled":
        return <XSquare className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
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

  if (err) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="rounded-xl border border-red-800/50 bg-gradient-to-br from-red-950/30 to-slate-950/30 p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-red-300">
                    Error Loading Repair
                  </h3>
                  <p className="mt-1 text-sm text-red-200">{err}</p>
                </div>
              </div>
            </div>
            <Link
              to="/repairs"
              className="inline-flex items-center mt-6 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Repairs
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!repair) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Loading repair details...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const daysUntilWarrantyExpiry = getDaysUntilWarrantyExpiry(
    repair.warrantyExpiry,
  );
  const warrantyExpiringSoon =
    daysUntilWarrantyExpiry !== null && daysUntilWarrantyExpiry <= 30;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link and Refresh */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/repairs"
              className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Repairs
            </Link>
            <button
              onClick={load}
              disabled={refreshing}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm">Refresh</span>
            </button>
          </div>

          {/* Main Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Repair Details
                  </h2>
                </div>
                {canWrite && (
                  <Link
                    to={`/repairs/${repair._id}/edit`}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Left Column - Main Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-slate-800/80 rounded-xl">
                      {getStatusIcon(repair.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-white">
                          {repair.vendorName}
                        </h1>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(repair.status)}`}
                        >
                          {getStatusIcon(repair.status)}
                          <span className="ml-1">{repair.status}</span>
                        </span>
                        {repair.isWarrantyClaim && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            warranty
                          </span>
                        )}
                      </div>

                      {/* Asset Link */}
                      <div className="mt-3 flex items-center text-sm">
                        <Package className="w-4 h-4 text-slate-500 mr-2" />
                        <span className="text-slate-400">Asset ID:</span>
                        <Link
                          to={`/assets/${repair.assetId}`}
                          className="ml-2 text-amber-400 hover:text-amber-300 hover:underline font-mono"
                        >
                          {repair.assetId}
                        </Link>
                      </div>

                      {/* Metadata Grid */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Reported:</span>
                            <span className="ml-2 text-slate-300">
                              {new Date(repair.reportedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Cost:</span>
                            <span className="ml-2 text-slate-300 font-medium">
                              ${repair.cost?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {repair.warrantyExpiry && (
                            <div className="flex items-center text-sm">
                              <Shield className="w-4 h-4 text-slate-500 mr-2" />
                              <span className="text-slate-400">
                                Warranty until:
                              </span>
                              <span
                                className={`ml-2 ${warrantyExpiringSoon ? "text-amber-400" : "text-slate-300"}`}
                              >
                                {new Date(
                                  repair.warrantyExpiry,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {repair.warrantyProvider && (
                            <div className="flex items-center text-sm">
                              <Building2 className="w-4 h-4 text-slate-500 mr-2" />
                              <span className="text-slate-400">Provider:</span>
                              <span className="ml-2 text-slate-300">
                                {repair.warrantyProvider}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Warranty Expiry Alert */}
                      {warrantyExpiringSoon && repair.isWarrantyClaim && (
                        <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/30">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-amber-300">
                                Warranty Expiring Soon
                              </p>
                              <p className="text-xs text-amber-400/80 mt-1">
                                This warranty expires in{" "}
                                {daysUntilWarrantyExpiry} days
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Issue Section */}
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5 text-slate-500" />
                          Issue Description
                        </h3>
                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                          <p className="text-slate-300 whitespace-pre-wrap">
                            {repair.issue}
                          </p>
                        </div>
                      </div>

                      {/* Resolution Section */}
                      {repair.resolution && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1.5 text-slate-500" />
                            Resolution
                          </h3>
                          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                            <p className="text-slate-300 whitespace-pre-wrap">
                              {repair.resolution}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Notes Section */}
                      {repair.notes && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
                            Additional Notes
                          </h3>
                          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                            <p className="text-slate-300 whitespace-pre-wrap">
                              {repair.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Status Timeline */}
                <div className="lg:w-80 space-y-3">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">
                    Status Timeline
                  </h3>

                  {/* Reported */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Reported</p>
                      <p className="text-xs text-slate-500">
                        {new Date(repair.reportedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Sent (if applicable) */}
                  {repair.sentAt && (
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="p-1.5 bg-purple-500/10 rounded-lg">
                        <Truck className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          Sent to Vendor
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(repair.sentAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Returned (if applicable) */}
                  {repair.returnedAt && (
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="p-1.5 bg-green-500/10 rounded-lg">
                        <Package className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          Returned
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(repair.returnedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Closed (if applicable) */}
                  {repair.closedAt && (
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Closed</p>
                        <p className="text-xs text-slate-500">
                          {new Date(repair.closedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Created At */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <p className="text-xs text-slate-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Record created:{" "}
                      {new Date(repair.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
