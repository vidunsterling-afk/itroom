/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";

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
  const { id } = useParams(); // if present -> edit
  const editing = !!id;

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

  useEffect(() => {
    if (editing) return;
    const params = new URLSearchParams(loc.search);
    const a = params.get("assetId");
    if (a) setAssetId(a);
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
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      if (!editing && !assetId.trim())
        throw new Error("assetId is required (paste the asset _id for now)");
      if (!vendorName.trim()) throw new Error("Vendor is required");
      if (!issue.trim()) throw new Error("Issue is required");

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
        const data = await apiFetch<{ repair: { _id: string } }>(
          "/api/repairs",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          },
        );
        nav(`/repairs/${data.repair._id}`, { replace: true });
      } else {
        await apiFetch(`/api/repairs/${id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        nav(`/repairs/${id}`, { replace: true });
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-semibold">
            {editing ? "Edit Repair" : "New Repair"}
          </h1>
          <p className="text-slate-400 mt-1">Linked to an asset</p>

          <form
            onSubmit={submit}
            className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4"
          >
            {!editing && (
              <div>
                <label className="text-sm text-slate-300">
                  Asset ID (_id) *
                </label>
                <input
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  placeholder="Paste asset Mongo _id (we’ll improve UX inside Asset page next)"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-slate-300">Vendor *</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="ABC Repairs"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-300">Status</label>
                <select
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="reported">reported</option>
                  <option value="sent">sent</option>
                  <option value="repairing">repairing</option>
                  <option value="returned">returned</option>
                  <option value="closed">closed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-300">Cost</label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={cost}
                  onChange={(e) => setCost(parseFloat(e.target.value || "0"))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Issue *</label>
              <textarea
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 min-h-[90px]"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Resolution</label>
              <textarea
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 min-h-[90px]"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isWarrantyClaim}
                onChange={(e) => setIsWarrantyClaim(e.target.checked)}
              />
              Warranty claim
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-300">
                  Warranty Expiry
                </label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={warrantyExpiry}
                  onChange={(e) => setWarrantyExpiry(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">
                  Warranty Provider
                </label>
                <input
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={warrantyProvider}
                  onChange={(e) => setWarrantyProvider(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Notes</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {err && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                {err}
              </div>
            )}

            <button className="w-full rounded-xl bg-slate-100 text-slate-950 py-2 font-medium hover:opacity-90">
              Save
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
