import { useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";

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

  async function submit() {
    setErr(null);
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
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Change Status</div>
            <div className="text-sm text-slate-400">
              This will be recorded in history
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-slate-300">Status</label>
            <select
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="active">active</option>
              <option value="in-repair">in-repair</option>
              <option value="retired">retired</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300">Note (optional)</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., sent for repair"
            />
          </div>

          {err && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
              {err}
            </div>
          )}

          <button
            onClick={submit}
            className="w-full rounded-xl bg-slate-100 text-slate-950 py-2 font-medium hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
