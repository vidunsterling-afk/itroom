import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";
import {
  Key,
  Save,
  AlertCircle,
  Info,
  Building2,
  Tag,
  Calendar,
  FileText,
  Users,
  DollarSign,
  Clock,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

type Types = "subscription" | "perpetual";

export default function LicenseCreate() {
  const nav = useNavigate();

  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [type, setType] = useState<"subscription" | "perpetual">(
    "subscription",
  );
  const [seatsTotal, setSeatsTotal] = useState(1);
  const [expiresAt, setExpiresAt] = useState("");
  const [renewalAt, setRenewalAt] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsSubmitting(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ license: { _id: string } }>(
        "/api/licenses",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            key: key.trim(),
            name: name.trim(),
            vendor: vendor.trim(),
            type,
            seatsTotal,
            expiresAt: expiresAt
              ? new Date(expiresAt).toISOString()
              : undefined,
            renewalAt: renewalAt
              ? new Date(renewalAt).toISOString()
              : undefined,
            notes: notes.trim() || undefined,
          }),
        },
      );

      nav(`/licenses/${data.license._id}`, { replace: true });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create license");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Page Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Key className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Create New License
                </h1>
                <p className="mt-2 text-slate-400 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-purple-400" />
                  Add a new software license to the inventory (Admin only)
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">
                  License Details
                </h2>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="p-6 space-y-5">
              {/* License Key */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  License Key <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="e.g., M365-BUSINESS-2024"
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  License Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Microsoft 365 Business Standard"
                    required
                  />
                </div>
              </div>

              {/* Vendor */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Vendor <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g., Microsoft"
                    required
                  />
                </div>
              </div>

              {/* Type and Seats */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    License Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {type === "subscription" ? (
                        <Clock className="h-4 w-4 text-slate-500" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    <select
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 appearance-none focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      value={type}
                      onChange={(e) => setType(e.target.value as Types)}
                    >
                      <option value="subscription">
                        Subscription (recurring)
                      </option>
                      <option value="perpetual">Perpetual (one-time)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Total Seats
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      value={seatsTotal}
                      onChange={(e) =>
                        setSeatsTotal(parseInt(e.target.value || "1", 10))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Expiry and Renewal */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Expiration Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="date"
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Renewal Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="date"
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      value={renewalAt}
                      onChange={(e) => setRenewalAt(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional information about this license..."
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
                  className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating License...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create License</span>
                    </>
                  )}
                </button>
                <Link
                  to="/licenses"
                  className="px-6 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors flex items-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Help Note */}
          <div className="mt-6 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-purple-400">
                  License Key Format:
                </span>{" "}
                Use a consistent naming convention for license keys to make them
                easily searchable. Include vendor, product, and year if
                applicable.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
