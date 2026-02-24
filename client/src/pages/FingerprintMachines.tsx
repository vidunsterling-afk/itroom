import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";
import {
  Fingerprint,
  Plus,
  Search,
  Edit,
  XCircle,
  AlertCircle,
  Save,
  MapPin,
  Building2,
  HardDrive,
  Tag,
  FileText,
  RefreshCw,
  Info,
  Power,
  PowerOff,
} from "lucide-react";

type MachinePayload = {
  name: string;
  location: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  isActive: boolean;
  machineCode?: string;
};

type Machine = {
  _id: string;
  machineCode: string;
  name: string;
  location: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  isActive: boolean;
};

export default function FingerprintMachines() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);

  // form
  const [machineCode, setMachineCode] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ items: Machine[] }>(
        `/api/fingerprints/machines${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setItems(data.items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load machines");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  function openCreate() {
    setEditing(null);
    setMachineCode("");
    setName("");
    setLocation("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setIsActive(true);
    setFormErr(null);
    setOpen(true);
  }

  function openEdit(m: Machine) {
    setEditing(m);
    setMachineCode(m.machineCode);
    setName(m.name);
    setLocation(m.location);
    setBrand(m.brand ?? "");
    setModel(m.model ?? "");
    setSerialNumber(m.serialNumber ?? "");
    setIsActive(!!m.isActive);
    setFormErr(null);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    setIsSubmitting(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      if (!name.trim()) throw new Error("Name is required");
      if (!location.trim()) throw new Error("Location is required");
      if (!editing && !machineCode.trim())
        throw new Error("Machine code is required");

      const payload: MachinePayload = {
        name: name.trim(),
        location: location.trim(),
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        isActive,
      };

      if (!editing) {
        payload.machineCode = machineCode.trim();
        await apiFetch("/api/fingerprints/machines", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/api/fingerprints/machines/${editing._id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }

      setOpen(false);
      await load();
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-500/10 rounded-xl">
                    <Fingerprint className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Fingerprint Machines
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <HardDrive className="w-4 h-4 mr-2 text-cyan-400" />
                      Manage biometric devices and their locations
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
                  onClick={openCreate}
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-300">
                    New Machine
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
              <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-3">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-medium text-white">
                    Search Machines
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by machine code, name, location..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all border border-cyan-500/30"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </form>

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

          {/* Machines Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Biometric Devices
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300">
                    {items.length} total
                  </span>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400">Loading machines...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Fingerprint className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No machines found
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {q
                    ? "No machines match your search criteria."
                    : "Get started by adding your first biometric device."}
                </p>
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Clear search</span>
                  </button>
                )}
                {!q && (
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Machine</span>
                  </button>
                )}
              </div>
            ) : (
              /* Machines List */
              <div className="divide-y divide-slate-800">
                {items.map((m) => (
                  <div
                    key={m._id}
                    className="p-6 hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Machine Info */}
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-slate-800/80 rounded-lg mt-1">
                            <Fingerprint className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-medium text-white">
                                {m.machineCode}
                              </h3>
                              <span className="text-sm text-slate-400">
                                {m.name}
                              </span>
                              {m.isActive ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/30">
                                  <Power className="w-3 h-3 mr-1" />
                                  active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/10 text-xs text-red-400 border border-red-500/30">
                                  <PowerOff className="w-3 h-3 mr-1" />
                                  inactive
                                </span>
                              )}
                            </div>

                            {/* Location */}
                            <div className="mt-2 flex items-center text-sm">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                              <span className="text-slate-400">Location:</span>
                              <span className="ml-1.5 text-slate-300">
                                {m.location}
                              </span>
                            </div>

                            {/* Hardware Details */}
                            {(m.brand || m.model || m.serialNumber) && (
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                {m.brand && (
                                  <span className="flex items-center text-slate-500">
                                    <Building2 className="w-3 h-3 mr-1" />
                                    Brand:{" "}
                                    <span className="text-slate-400 ml-1">
                                      {m.brand}
                                    </span>
                                  </span>
                                )}
                                {m.model && (
                                  <span className="flex items-center text-slate-500">
                                    <HardDrive className="w-3 h-3 mr-1" />
                                    Model:{" "}
                                    <span className="text-slate-400 ml-1">
                                      {m.model}
                                    </span>
                                  </span>
                                )}
                                {m.serialNumber && (
                                  <span className="flex items-center text-slate-500">
                                    <Tag className="w-3 h-3 mr-1" />
                                    SN:{" "}
                                    <span className="text-slate-400 ml-1 font-mono">
                                      {m.serialNumber}
                                    </span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEdit(m)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Card Footer */}
            {!loading && items.length > 0 && (
              <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
                <div className="flex items-center text-xs text-slate-500">
                  <Info className="w-3 h-3 mr-1 text-slate-600" />
                  Active machines are available for enrollment assignments
                </div>
              </div>
            )}
          </div>

          {/* Modal */}
          {open && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        {editing ? (
                          <Edit className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <Plus className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {editing ? "Edit Machine" : "Add New Machine"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {editing
                            ? `Machine Code: ${editing.machineCode}`
                            : "Create a new biometric device record"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Modal Form */}
                <form onSubmit={save} className="p-6 space-y-4">
                  {!editing && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">
                        Machine Code <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                          value={machineCode}
                          onChange={(e) => setMachineCode(e.target.value)}
                          placeholder="e.g., FP-001"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Device Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Fingerprint className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Main Entrance Scanner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Location <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="HQ • Floor 1 • Main Entrance"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">
                        Brand
                      </label>
                      <input
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g., HIKVision"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">
                        Model
                      </label>
                      <input
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g., DS-K1T341"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Serial Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="SN-12345-67890"
                      />
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center space-x-3">
                      {isActive ? (
                        <Power className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <PowerOff className="w-5 h-5 text-slate-500" />
                      )}
                      <div>
                        <label className="text-sm font-medium text-slate-300">
                          Device Status
                        </label>
                        <p className="text-xs text-slate-500">
                          {isActive
                            ? "Active and available for use"
                            : "Inactive (disabled)"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isActive ? "bg-emerald-500/20" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Form Error */}
                  {formErr && (
                    <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-3">
                      <p className="text-sm text-red-300 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {formErr}
                      </p>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>
                            {editing ? "Update Machine" : "Create Machine"}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-6 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
