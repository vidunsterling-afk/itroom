/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";
import {
  Wrench,
  Save,
  XCircle,
  AlertCircle,
  Info,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  HelpCircle,
  ArrowLeft,
  Package,
  Settings,
  CheckCircle,
} from "lucide-react";
import { sendRepairCreatedEmail } from "../email/helpers/repairEmail";
import { useAuth } from "../context/useAuth";

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
};

export default function RepairUpsert() {
  const nav = useNavigate();
  const loc = useLocation();
  const { id } = useParams();
  const editing = !!id;
  const { user } = useAuth();

  const [assetId, setAssetId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [cost, setCost] = useState(0);
  const [status, setStatus] = useState("reported");
  const [issue, setIssue] = useState("");
  const [resolution, setResolution] = useState("");
  const [isWarrantyClaim, setIsWarrantyClaim] = useState(false);
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [warrantyProvider, setWarrantyProvider] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toEmail, setToEmail] = useState("");
  const [originalStatus, setOriginalStatus] = useState<string>("");

  useEffect(() => {
    if (editing) return;
    const params = new URLSearchParams(loc.search);

    const a = params.get("assetId");
    if (a) setAssetId(a);

    const to = params.get("to");
    if (typeof to === "string" && to.trim().length > 0) {
      setToEmail(to.trim());
    }
  }, [editing, loc.search]);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        const token = getAccessToken();
        if (!token) throw new Error("No access token");

        const data = await apiFetch<{ repair: Repair }>(`/api/repairs/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const r = data.repair;
        setAssetId(r.assetId);
        setVendorName(r.vendorName);
        setCost(r.cost ?? 0);
        setStatus(r.status);
        setOriginalStatus(r.status);
        setIssue(r.issue);
        setResolution(r.resolution ?? "");
        setIsWarrantyClaim(!!r.isWarrantyClaim);
        setWarrantyExpiry(
          r.warrantyExpiry ? r.warrantyExpiry.slice(0, 10) : "",
        );
        setWarrantyProvider(r.warrantyProvider ?? "");
        setNotes(r.notes ?? "");
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to load repair");
      }
    })();
  }, [editing, id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsSubmitting(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      if (!editing && !assetId.trim()) throw new Error("Asset ID is required");
      if (!vendorName.trim()) throw new Error("Vendor name is required");
      if (!issue.trim()) throw new Error("Issue description is required");

      const payload: any = {
        vendorName: vendorName.trim(),
        cost,
        status,
        issue: issue.trim(),
        resolution: resolution.trim() || undefined,
        isWarrantyClaim,
        warrantyExpiry: warrantyExpiry
          ? new Date(warrantyExpiry).toISOString()
          : undefined,
        warrantyProvider: warrantyProvider.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (!editing) payload.assetId = assetId.trim();

      if (!editing) {
        const data = await apiFetch<{ repair: Repair & { _id: string } }>(
          "/api/repairs",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          },
        );

        const assetIdTrimmed = assetId.trim();
        const asset = await apiFetch<{ asset: any }>(
          `/api/assets/${assetIdTrimmed}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        await sendRepairCreatedEmail({
          token,
          to: toEmail || "sterlingsteels.it@gmail.com",
          createdBy: user?.username,
          repair: {
            ...payload,
            _id: data.repair._id,
            assetId,
            reportedAt: new Date().toISOString(),
          },
          asset: asset.asset,
        });

        nav(`/repairs/${data.repair._id}`, { replace: true });
      } else {
        await apiFetch(`/api/repairs/${id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });

        // If status changed, send email
        const newStatus = status;
        const oldStatus = originalStatus;

        if (oldStatus && newStatus && oldStatus !== newStatus) {
          // fetch asset to get assignee email (better than query param)
          const assetRes = await apiFetch<{ asset: any }>(
            `/api/assets/${assetId}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          const to =
            assetRes.asset?.currentAssignment?.assigneeEmail ||
            "sterlingsteels.it@gmail.com";

          console.log(to);
          try {
            const { sendRepairStatusChangedEmail } =
              await import("../email/helpers/repairStatusEmail");

            await sendRepairStatusChangedEmail({
              token,
              to,
              createdBy: user?.username,
              asset: assetRes.asset,
              repair: { ...payload, _id: id, assetId },
              oldStatus,
              newStatus,
            });
          } catch (mailErr) {
            console.warn("Status email failed:", mailErr);
          }
        }

        nav(`/repairs/${id}`, { replace: true });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to save repair");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reported":
        return <AlertCircle className="w-5 h-5" />;
      case "sent":
        return <Package className="w-5 h-5" />;
      case "repairing":
        return <Settings className="w-5 h-5" />;
      case "returned":
        return <Package className="w-5 h-5" />;
      case "closed":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <div className="mb-6">
            <Link
              to="/repairs"
              className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Repairs
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Wrench className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {editing ? "Edit Repair Record" : "Create New Repair"}
                </h1>
                <p className="mt-2 text-slate-400 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-amber-400" />
                  {editing
                    ? "Update repair information"
                    : "Log a new repair for an asset"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">
                  Repair Details
                </h2>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="p-6 space-y-5">
              {/* Asset ID (only for new) */}
              {!editing && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Asset ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                      value={assetId}
                      onChange={(e) => setAssetId(e.target.value)}
                      placeholder="Enter asset ID"
                      required
                    />
                  </div>
                  <p className="flex items-center text-xs text-slate-500 mt-1.5">
                    <HelpCircle className="w-3 h-3 mr-1 text-slate-600" />
                    Paste the asset ID (we'll add asset selection in a future
                    update)
                  </p>
                </div>
              )}

              {/* Vendor Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Vendor Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g., ABC Repair Services"
                    required
                  />
                </div>
              </div>

              {/* Status and Cost */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Status
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getStatusIcon(status)}
                    </div>
                    <select
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 appearance-none focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="reported">Reported</option>
                      <option value="sent">Sent to Vendor</option>
                      <option value="repairing">In Repair</option>
                      <option value="returned">Returned</option>
                      <option value="closed">Closed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Cost ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                      value={cost}
                      onChange={(e) =>
                        setCost(parseFloat(e.target.value || "0"))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Issue */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Issue Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all min-h-[100px]"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Describe the issue with the asset..."
                  required
                />
              </div>

              {/* Resolution */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Resolution
                </label>
                <textarea
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all min-h-[100px]"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="How was the issue resolved?"
                />
              </div>

              {/* Warranty Toggle */}
              <div className="flex items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="flex items-center space-x-3 flex-1">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <div>
                    <label
                      htmlFor="warranty-toggle"
                      className="text-sm font-medium text-slate-300"
                    >
                      Warranty Claim
                    </label>
                    <p className="text-xs text-slate-500">
                      Is this repair covered under warranty?
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWarrantyClaim(!isWarrantyClaim)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isWarrantyClaim ? "bg-amber-500/20" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isWarrantyClaim ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Warranty Details (conditional) */}
              {isWarrantyClaim && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Warranty Expiry
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        type="date"
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                        value={warrantyExpiry}
                        onChange={(e) => setWarrantyExpiry(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Warranty Provider
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                        value={warrantyProvider}
                        onChange={(e) => setWarrantyProvider(e.target.value)}
                        placeholder="Warranty provider name"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Additional Notes
                </label>
                <textarea
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all min-h-[80px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information about this repair..."
                />
              </div>

              {/* Error Message */}
              {err && (
                <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{err}</p>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{editing ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editing ? "Update Repair" : "Create Repair"}</span>
                    </>
                  )}
                </button>
                <Link
                  to="/repairs"
                  className="px-6 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors flex items-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Help Note */}
          <div className="mt-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-amber-400">
                  Repair Lifecycle:
                </span>{" "}
                Track each repair from initial report to completion. Status
                updates help monitor progress and warranty claims ensure proper
                coverage.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
