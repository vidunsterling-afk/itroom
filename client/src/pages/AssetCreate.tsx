import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";

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

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

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
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold">New Asset</h1>
        <p className="text-slate-400 mt-1">Admin only</p>

        <form
          onSubmit={create}
          className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4"
        >
          <div>
            <label className="text-sm text-slate-300">Asset Tag *</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Display Name *</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Finance Laptop 01"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Brand *</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Dell"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Model *</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Latitude 5420"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Category</label>
              <select
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="laptop">laptop</option>
                <option value="pc">pc</option>
                <option value="router">router</option>
                <option value="switch">switch</option>
                <option value="server">server</option>
                <option value="monitor">monitor</option>
                <option value="printer">printer</option>
                <option value="other">other</option>
              </select>
            </div>

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
          </div>

          <div>
            <label className="text-sm text-slate-300">Serial Number</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Notes</label>
            <textarea
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 min-h-[90px]"
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
            Create Asset
          </button>
        </form>
      </div>
    </div>
  );
}
