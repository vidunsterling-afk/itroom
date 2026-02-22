// components/ChangeStatusModal.tsx
import { useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import {
  XCircle,
  AlertCircle,
  CheckCircle,
  Wrench,
  Archive,
  Activity,
  FileText,
  Save,
  Info,
} from "lucide-react";

type Status = "active" | "in-repair" | "retired";

export function ChangeStatusModal({
  assetId,
  onClose,
  onDone,
}: {
  assetId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<"active" | "in-repair" | "retired">(
    "active",
  );
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setErr(null);
    setIsSubmitting(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      await apiFetch(`/api/assets/${assetId}/status`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, note: note.trim() || undefined }),
      });

      onDone();
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getStatusIcon = (statusType: Status) => {
    switch (statusType) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "in-repair":
        return <Wrench className="w-5 h-5 text-amber-400" />;
      case "retired":
        return <Archive className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusDescription = (statusType: Status) => {
    switch (statusType) {
      case "active":
        return "Asset is operational and available for use";
      case "in-repair":
        return "Asset is being repaired or serviced";
      case "retired":
        return "Asset is decommissioned and no longer in use";
    }
  };

  const getStatusColor = (statusType: Status) => {
    switch (statusType) {
      case "active":
        return "border-emerald-500/30 bg-emerald-500/5";
      case "in-repair":
        return "border-amber-500/30 bg-amber-500/5";
      case "retired":
        return "border-slate-500/30 bg-slate-500/5";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Change Asset Status
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update the operational status of this asset
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <XCircle className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Selection Cards */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Select New Status <span className="text-red-400">*</span>
            </label>

            <div className="grid gap-3">
              {(["active", "in-repair", "retired"] as Status[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`relative p-4 rounded-lg border transition-all ${
                    status === s
                      ? `${getStatusColor(s)} border-${s === "active" ? "emerald" : s === "in-repair" ? "amber" : "slate"}-500/50 ring-1 ring-${s === "active" ? "emerald" : s === "in-repair" ? "amber" : "slate"}-500/50`
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-800/80 rounded-lg">
                      {getStatusIcon(s)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-base font-medium capitalize ${
                            status === s ? "text-white" : "text-slate-300"
                          }`}
                        >
                          {s.replace("-", " ")}
                        </span>
                        {status === s && (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {getStatusDescription(s)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Note Field */}
          <div className="space-y-1.5">
            <label className="flex items-center text-sm font-medium text-slate-300">
              <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
              Note (optional)
            </label>
            <div className="relative">
              <textarea
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all min-h-[80px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this status change (e.g., reason for change)"
              />
            </div>
            <p className="flex items-center text-xs text-slate-500 mt-1.5">
              <Info className="w-3 h-3 mr-1 text-slate-600" />
              This note will be recorded in the asset history
            </p>
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
          <div className="flex space-x-3 pt-2">
            <button
              onClick={submit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Status</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Status Change Info */}
        <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
          <div className="flex items-center text-xs text-slate-500">
            <Info className="w-3 h-3 mr-1 text-slate-600" />
            Status changes are logged in the asset timeline with your username
          </div>
        </div>
      </div>
    </div>
  );
}
