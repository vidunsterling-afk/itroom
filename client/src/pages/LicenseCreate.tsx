import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
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
      setErr(e instanceof Error ? e.message : "Create failed");
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-semibold">New License</h1>
          <p className="text-slate-400 mt-1">Admin only</p>

          <form
            onSubmit={submit}
            className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4"
          >
            <div>
              <label className="text-sm text-slate-300">Key *</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="M365-BUSINESS"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Name *</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Microsoft 365 Business Standard"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Vendor *</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Microsoft"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-300">Type</label>
                <select
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={type}
                  onChange={(e) => setType(e.target.value as Types)}
                >
                  <option value="subscription">subscription</option>
                  <option value="perpetual">perpetual</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-300">Seats Total</label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={seatsTotal}
                  onChange={(e) =>
                    setSeatsTotal(parseInt(e.target.value || "0", 10))
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-300">Expires At</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Renewal At</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={renewalAt}
                  onChange={(e) => setRenewalAt(e.target.value)}
                />
              </div>
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
              Create License
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
