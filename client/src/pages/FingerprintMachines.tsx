import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";

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
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

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

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      if (!name.trim()) throw new Error("Name required");
      if (!location.trim()) throw new Error("Location required");
      if (!editing && !machineCode.trim())
        throw new Error("Machine code required");

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
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Fingerprint Machines</h1>
              <p className="text-slate-400 mt-1">
                Manage biometric devices + locations
              </p>
            </div>
            <button
              onClick={openCreate}
              className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
            >
              + New Machine
            </button>
          </div>

          <div className="mt-6">
            <input
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search code, name, location..."
            />
            <div className="mt-2">
              <button
                onClick={load}
                className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
              Machines
            </div>

            {loading ? (
              <div className="p-4 text-slate-400">Loading...</div>
            ) : err ? (
              <div className="p-4 text-red-200 bg-red-950/30 border-t border-red-900/60">
                {err}
              </div>
            ) : items.length === 0 ? (
              <div className="p-4 text-slate-400">No machines</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {items.map((m) => (
                  <div
                    key={m._id}
                    className="p-4 hover:bg-slate-900/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{m.machineCode}</span>
                        <span className="text-slate-300">{m.name}</span>
                        {!m.isActive && (
                          <span className="text-xs rounded-lg border border-red-900 px-2 py-1 text-red-200 bg-red-950/20">
                            inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        {m.location}
                        {m.brand || m.model
                          ? ` • ${m.brand ?? ""} ${m.model ?? ""}`.trim()
                          : ""}
                        {m.serialNumber ? ` • SN: ${m.serialNumber}` : ""}
                      </div>
                    </div>

                    <button
                      onClick={() => openEdit(m)}
                      className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {open && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">
                      {editing ? "Edit Machine" : "New Machine"}
                    </div>
                    <div className="text-sm text-slate-400">
                      {editing
                        ? `Code: ${editing.machineCode}`
                        : "Create a new device record"}
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={save} className="mt-4 space-y-3">
                  {!editing && (
                    <div>
                      <label className="text-sm text-slate-300">
                        Machine Code *
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                        value={machineCode}
                        onChange={(e) => setMachineCode(e.target.value)}
                        placeholder="FP-01"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-slate-300">Name *</label>
                    <input
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300">Location *</label>
                    <input
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="HQ • Floor 1 • Main Gate"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">Brand</label>
                      <input
                        className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Model</label>
                      <input
                        className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-300">
                      Serial Number
                    </label>
                    <input
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Active
                  </label>

                  {formErr && (
                    <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                      {formErr}
                    </div>
                  )}

                  <button className="w-full rounded-xl bg-slate-100 text-slate-950 py-2 font-medium hover:opacity-90">
                    Save
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
