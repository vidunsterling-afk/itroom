import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";
import {
  Package,
  RefreshCw,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  Key,
  FileText,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  HelpCircle,
  Grid,
  Clock,
} from "lucide-react";

type Mod = {
  _id: string;
  key: string;
  name: string;
  description?: string;
  isActive: boolean;
  actions: string[];
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_ACTIONS = ["read", "create", "update", "delete"];

export default function Modules() {
  const [items, setItems] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Mod | null>(null);

  // form
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [actionsText, setActionsText] = useState("read,create,update,delete");

  async function load() {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const data = await apiFetch<{ items: Mod[] }>("/api/modules", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(data.items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load modules");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setKey("");
    setName("");
    setDescription("");
    setIsActive(true);
    setActionsText(DEFAULT_ACTIONS.join(","));
    setOpen(true);
    setMsg(null);
    setErr(null);
  }

  function openEdit(m: Mod) {
    setEditing(m);
    setKey(m.key);
    setName(m.name);
    setDescription(m.description ?? "");
    setIsActive(!!m.isActive);
    setActionsText((m.actions?.length ? m.actions : DEFAULT_ACTIONS).join(","));
    setOpen(true);
    setMsg(null);
    setErr(null);
  }

  function parseActions(s: string) {
    const arr = s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    // de-dup
    return Array.from(new Set(arr));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const actions = parseActions(actionsText);
      if (!name.trim()) throw new Error("Name is required");
      if (!editing && !key.trim())
        throw new Error("Key is required (e.g., assets)");

      if (!actions.includes("read")) {
        throw new Error(`Actions must include "read"`);
      }

      if (!editing) {
        await apiFetch("/api/modules", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            key: key.trim(),
            name: name.trim(),
            description: description.trim() || undefined,
            isActive,
            actions,
          }),
        });
        setMsg("Module created successfully");
      } else {
        await apiFetch(`/api/modules/${editing._id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            isActive,
            actions,
          }),
        });
        setMsg("Module updated successfully");
      }

      setOpen(false);
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
                    <Package className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Module Registry
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-purple-400" />
                      Admin-only configuration for system modules and their
                      available actions
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
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
                >
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">
                    New Module
                  </span>
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

          {/* Modules Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Grid className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Registered Modules
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  {items.length} module{items.length !== 1 ? "s" : ""}{" "}
                  configured
                </span>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400">Loading modules...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No modules configured
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Get started by creating your first module.
                </p>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
                >
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">
                    Create Module
                  </span>
                </button>
              </div>
            ) : (
              /* Modules List */
              <div className="divide-y divide-slate-800">
                {items.map((m) => (
                  <div
                    key={m._id}
                    className="p-6 hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Module Info */}
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-slate-800/80 rounded-lg mt-1">
                            <Package className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-medium text-white">
                                {m.name}
                              </h3>
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
                                {m.key}
                              </span>
                              {!m.isActive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/10 text-xs text-red-400 border border-red-500/30">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  inactive
                                </span>
                              )}
                              {m.isActive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  active
                                </span>
                              )}
                            </div>

                            {m.description && (
                              <p className="mt-2 text-sm text-slate-400 flex items-start">
                                <FileText className="w-3.5 h-3.5 text-slate-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                {m.description}
                              </p>
                            )}

                            {/* Actions Tags */}
                            <div className="mt-3">
                              <div className="flex items-center text-xs text-slate-500 mb-1.5">
                                <Key className="w-3.5 h-3.5 mr-1" />
                                Available actions:
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {(m.actions ?? []).map((action) => (
                                  <span
                                    key={action}
                                    className="inline-flex items-center px-2 py-1 rounded-md bg-slate-800/80 text-xs text-slate-300 border border-slate-700"
                                  >
                                    {action}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="mt-3 flex items-center space-x-3 text-xs text-slate-600">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Created: {formatDate(m.createdAt)}
                              </span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Updated: {formatDate(m.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="lg:self-center">
                        <button
                          onClick={() => openEdit(m)}
                          className="group flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all"
                        >
                          <Edit className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                          <span className="text-sm text-slate-300">
                            Edit Module
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Card Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4 text-slate-500">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                      Active modules
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                      Inactive modules
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Last updated: {new Date().toLocaleTimeString()}
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
                  Module Configuration:
                </span>{" "}
                Each module defines a set of available actions that can be
                assigned to staff roles. The "read" action is required for all
                modules and enables basic view permissions.
              </div>
            </div>
          </div>

          {/* Modal */}
          {open && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        {editing ? (
                          <Edit className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Plus className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {editing ? "Edit Module" : "Create New Module"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {editing
                            ? `Editing module: ${editing.key}`
                            : "Configure a new system module"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Modal Form */}
                <form onSubmit={save} className="p-6 space-y-4">
                  {!editing && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Module Key <span className="text-red-400">*</span>
                      </label>
                      <input
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="e.g., assets, users, licenses"
                      />
                      <p className="flex items-center text-xs text-slate-500 mt-1.5">
                        <HelpCircle className="w-3 h-3 mr-1 text-slate-600" />
                        Use lowercase, no spaces. Used in permission checks.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Module Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Asset Management"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Description
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this module's purpose"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Available Actions <span className="text-red-400">*</span>
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                      value={actionsText}
                      onChange={(e) => setActionsText(e.target.value)}
                      placeholder="read,create,update,delete,assign,export"
                    />
                    <p className="flex items-center text-xs text-slate-500 mt-1.5">
                      <HelpCircle className="w-3 h-3 mr-1 text-slate-600" />
                      Comma-separated. Must include{" "}
                      <span className="text-slate-300">read</span>.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center space-x-3">
                      {isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-500" />
                      )}
                      <div>
                        <label
                          htmlFor="active-toggle"
                          className="text-sm font-medium text-slate-300"
                        >
                          Module Status
                        </label>
                        <p className="text-xs text-slate-500">
                          {isActive
                            ? "Active and available for use"
                            : "Inactive and hidden from non-admins"}
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

                  {err && (
                    <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-3">
                      <p className="text-sm text-red-300 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {err}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editing ? "Update Module" : "Create Module"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-4 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors"
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
