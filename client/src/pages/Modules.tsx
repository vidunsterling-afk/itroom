import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";

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
        setMsg("Module created");
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
        setMsg("Module updated");
      }

      setOpen(false);
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">Modules</h1>
            <p className="text-slate-400 mt-1">Admin-only module registry</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
            >
              Refresh
            </button>
            <button
              onClick={openCreate}
              className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
            >
              + New Module
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-4 rounded-xl border border-emerald-900 bg-emerald-950/30 p-3 text-sm text-emerald-200">
            {msg}
          </div>
        )}
        {err && (
          <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
            Registered Modules
          </div>

          {loading ? (
            <div className="p-4 text-slate-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-slate-400">No modules yet</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {items.map((m) => (
                <div key={m._id} className="p-4 hover:bg-slate-900/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                          {m.key}
                        </div>
                        {!m.isActive && (
                          <div className="text-xs rounded-lg border border-red-900 px-2 py-1 text-red-200 bg-red-950/20">
                            inactive
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        Actions:{" "}
                        <span className="text-slate-200">
                          {(m.actions ?? []).join(", ")}
                        </span>
                      </div>
                      {m.description && (
                        <div className="mt-1 text-sm text-slate-500">
                          {m.description}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => openEdit(m)}
                      className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
                    >
                      Edit
                    </button>
                  </div>
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
                    {editing ? "Edit Module" : "New Module"}
                  </div>
                  <div className="text-sm text-slate-400">
                    {editing
                      ? `Key: ${editing.key}`
                      : "Choose a unique key (e.g., assets)"}
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
                    <label className="text-sm text-slate-300">Key *</label>
                    <input
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="assets"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Use lowercase, no spaces. This is used in requirePerm().
                    </p>
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
                  <label className="text-sm text-slate-300">Description</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">
                    Actions (comma-separated) *
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                    value={actionsText}
                    onChange={(e) => setActionsText(e.target.value)}
                    placeholder="read,create,update,delete"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Must include <span className="text-slate-300">read</span>.
                    Add custom actions like{" "}
                    <span className="text-slate-300">assign,status</span>.
                  </p>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Active
                </label>

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
        )}
      </div>
    </div>
  );
}
