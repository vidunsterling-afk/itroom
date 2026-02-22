// pages/AssetCreate.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";
import {
  Package,
  Save,
  AlertCircle,
  Info,
  Laptop,
  Server,
  Monitor,
  Printer,
  Wifi,
  HardDrive,
  Tag,
  Box,
  FileText,
  HelpCircle,
} from "lucide-react";

type Status = "active" | "in-repair" | "retired";

export default function AssetCreate() {
  const nav = useNavigate();
  const [assetTag, setAssetTag] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("laptop");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState<"active" | "in-repair" | "retired">(
    "active",
  );
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsSubmitting(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token. Please login again.");

      const data = await apiFetch<{ asset: { _id: string } }>("/api/assets", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assetTag: assetTag.trim(),
          name: name.trim(),
          brand: brand.trim(),
          model: model.trim(),
          category,
          serialNumber: serialNumber.trim() || undefined,
          status,
          notes: notes.trim() || undefined,
        }),
      });

      nav(`/assets/${data.asset._id}`, { replace: true });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
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

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back Link */}
          <div className="mb-6">
            <Link
              to="/assets"
              className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Assets
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Create New Asset
                </h1>
                <p className="mt-2 text-slate-400 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-blue-400" />
                  Add a new hardware asset to the inventory (Admin only)
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center space-x-2">
                <Box className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">
                  Asset Details
                </h2>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={create} className="p-6 space-y-5">
              {/* Asset Tag */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Asset Tag <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    placeholder="e.g., AST-2024-001"
                    required
                  />
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Finance Laptop 01"
                    required
                  />
                </div>
              </div>

              {/* Brand and Model */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Brand <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Dell, HP, Lenovo..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Model <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Latitude 5420"
                    required
                  />
                </div>
              </div>

              {/* Category and Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Category
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getCategoryIcon(category)}
                    </div>
                    <select
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 appearance-none focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
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
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                  >
                    <option value="active">Active</option>
                    <option value="in-repair">In Repair</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              {/* Serial Number */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Serial Number
                </label>
                <input
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="SN-12345-67890"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional information about this asset..."
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
                  className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Asset...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Asset</span>
                    </>
                  )}
                </button>
                <Link
                  to="/assets"
                  className="px-6 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors flex items-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Help Note */}
          <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-blue-400">
                  Asset Tag Format:
                </span>{" "}
                Use a consistent naming convention like{" "}
                <code className="text-xs bg-slate-800 px-1 py-0.5 rounded">
                  DEPT-TYPE-###
                </code>{" "}
                (e.g., FIN-LTP-001) for easy identification.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
