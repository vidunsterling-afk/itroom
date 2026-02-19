import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import { AssignEmployeeModal } from "../components/AssignEmployeeModal";
import { ChangeStatusModal } from "../components/ChangeStatusModal";

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

      setAsset(a.asset);
      setEvents(ev.items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load asset");
    } finally {
      setLoading(false);
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

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        Loading...
      </div>
    );

  if (err)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-200">
            {err}
          </div>
          <Link
            to="/assets"
            className="inline-block mt-4 text-slate-300 hover:underline"
          >
            ← Back to Assets
          </Link>
        </div>
      </div>
    );

  if (!asset) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link to="/assets" className="text-slate-300 hover:underline">
          ← Back to Assets
        </Link>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold">{asset.assetTag}</h1>
                <span className="text-slate-300">
                  {asset.brand} {asset.model}
                </span>
                <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                  {asset.category}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-lg border ${
                    asset.status === "active"
                      ? "border-emerald-900 text-emerald-200 bg-emerald-950/20"
                      : asset.status === "in-repair"
                        ? "border-amber-900 text-amber-200 bg-amber-950/20"
                        : "border-slate-700 text-slate-300 bg-slate-900/20"
                  }`}
                >
                  {asset.status}
                </span>
              </div>

              <p className="mt-2 text-slate-300">{asset.name}</p>

              <div className="mt-2 text-sm text-slate-400">
                Serial:{" "}
                <span className="text-slate-200">
                  {asset.serialNumber ?? "—"}
                </span>
              </div>

              <div className="mt-2 text-sm text-slate-400">
                Assigned to:{" "}
                <span className="text-slate-200">
                  {asset.currentAssignment?.assigneeName ?? "—"}
                </span>
                {asset.currentAssignment?.assignedAt ? (
                  <span className="text-slate-500">
                    {" "}
                    • since{" "}
                    {new Date(
                      asset.currentAssignment.assignedAt,
                    ).toLocaleDateString()}
                  </span>
                ) : null}
              </div>

              {asset.notes && (
                <div className="mt-3 text-sm text-slate-300">{asset.notes}</div>
              )}
            </div>

            {canWrite && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAssignOpen(true)}
                  className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
                >
                  Assign
                </button>

                <button
                  onClick={unassign}
                  disabled={!asset.currentAssignment}
                  className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900 disabled:opacity-50"
                >
                  Unassign
                </button>

                <button
                  onClick={() => setStatusOpen(true)}
                  className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
                >
                  Change Status
                </button>
              </div>
            )}
          </div>
        </div>

        {err && (
          <div className="max-w-5xl mx-auto mt-4 rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-200">
            {err}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
            Timeline (latest 25)
          </div>
          {events.length === 0 ? (
            <div className="p-4 text-slate-400">No events</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {events.map((ev) => (
                <div key={ev._id} className="p-4 hover:bg-slate-900/30">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-200 font-medium">
                      {ev.type}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-sm">
                      • {ev.actorUsername ?? "system"}
                    </span>
                  </div>
                  {ev.note && (
                    <div className="mt-1 text-sm text-slate-300">{ev.note}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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
  );
}
