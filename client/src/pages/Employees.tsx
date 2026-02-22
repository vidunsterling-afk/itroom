import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";

type Employee = {
  _id: string;
  employeeId: string;
  fullName: string;
  email?: string;
  department?: string;
  title?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
};

export default function Employees() {
  const { user } = useAuth();

  const canWrite = user?.role === "admin" || user?.role === "staff";

  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Employee[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  // form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (department.trim()) p.set("department", department.trim());
    p.set("page", String(page));
    p.set("limit", "25");
    return p.toString();
  }, [q, department, page]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token. Please login again.");

      const data = await apiFetch<{
        totalPages: number;
        items: Employee[];
      }>(`/api/employees?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function openCreate() {
    setEditing(null);
    setFullName("");
    setEmail("");
    setDept("");
    setTitle("");
    setPhone("");
    setIsActive(true);
    setOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setFullName(emp.fullName ?? "");
    setEmail(emp.email ?? "");
    setDept(emp.department ?? "");
    setTitle(emp.title ?? "");
    setPhone(emp.phone ?? "");
    setIsActive(emp.isActive ?? true);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const token = getAccessToken();
    if (!token) return setErr("No access token. Please login again.");

    const payload = {
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      department: dept.trim() || undefined,
      title: title.trim() || undefined,
      phone: phone.trim() || undefined,
      isActive,
    };

    try {
      if (!payload.fullName) throw new Error("Full name is required");

      if (!editing) {
        await apiFetch<{ employee: Employee }>("/api/employees", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<{ employee: Employee }>(
          `/api/employees/${editing._id}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          },
        );
      }

      setOpen(false);
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Employees</h1>
              <p className="text-slate-400 mt-1">
                Managed by IT staff (Employee IDs auto-generated)
              </p>
            </div>

            <div className="flex gap-2">
              {canWrite && (
                <button
                  onClick={openCreate}
                  className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
                >
                  + New Employee
                </button>
              )}
              <button
                onClick={() => load()}
                className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Search</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Name or EmployeeID"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Department</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={department}
                onChange={(e) => {
                  setPage(1);
                  setDepartment(e.target.value);
                }}
                placeholder="IT, HR, Finance..."
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Page <span className="text-slate-100">{page}</span> /{" "}
              <span className="text-slate-100">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
              Employees
            </div>

            {loading ? (
              <div className="p-4 text-slate-400">Loading...</div>
            ) : err ? (
              <div className="p-4 text-red-200 bg-red-950/30 border-t border-red-900/60">
                {err}
              </div>
            ) : items.length === 0 ? (
              <div className="p-4 text-slate-400">No results</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {items.map((emp) => (
                  <div key={emp._id} className="p-4 hover:bg-slate-900/30">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium text-slate-100">
                            {emp.fullName}
                          </div>
                          <div className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                            {emp.employeeId}
                          </div>
                          {!emp.isActive && (
                            <div className="text-xs rounded-lg border border-red-900 px-2 py-1 text-red-200 bg-red-950/20">
                              inactive
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          {emp.department ?? "—"} • {emp.title ?? "—"} •{" "}
                          {emp.email ?? "—"}
                        </div>
                      </div>

                      {canWrite && (
                        <button
                          onClick={() => openEdit(emp)}
                          className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
                        >
                          Edit
                        </button>
                      )}
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
                      {editing ? "Edit Employee" : "New Employee"}
                    </div>
                    <div className="text-sm text-slate-400">
                      {editing
                        ? editing.employeeId
                        : "Employee ID will be auto-generated"}
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
                  <div>
                    <label className="text-sm text-slate-300">
                      Full Name *
                    </label>
                    <input
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">Email</label>
                      <input
                        className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Phone</label>
                      <input
                        className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">
                        Department
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Title</label>
                      <input
                        className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
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
    </Layout>
  );
}
