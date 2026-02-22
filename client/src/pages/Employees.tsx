// pages/Employees.tsx
import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout";
import {
  Users,
  RefreshCw,
  Plus,
  Edit,
  Search,
  Filter,
  Mail,
  Phone,
  Briefcase,
  Building2,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Calendar,
  IdCard,
} from "lucide-react";

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
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
        total: number;
        items: Employee[];
      }>(`/api/employees?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(data.items);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load employees");
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    setErr(null);
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
    setErr(null);
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

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const clearFilters = () => {
    setQ("");
    setDepartment("");
    setPage(1);
  };

  const getDepartmentColor = (dept?: string) => {
    if (!dept) return "bg-slate-800 text-slate-400";

    const colors: Record<string, string> = {
      IT: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      HR: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      Finance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      Marketing: "bg-pink-500/10 text-pink-400 border-pink-500/30",
      Operations: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      Sales: "bg-green-500/10 text-green-400 border-green-500/30",
    };

    return colors[dept] || "bg-slate-800 text-slate-400 border-slate-700";
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
                  <div className="p-2 bg-green-500/10 rounded-xl">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Employee Directory
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-green-400" />
                      Manage employee records, departments, and positions
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
                {canWrite && (
                  <button
                    onClick={openCreate}
                    className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">
                      New Employee
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-green-400" />
                  <h2 className="text-sm font-medium text-white">
                    Filter Employees
                  </h2>
                </div>
                {(q || department) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Search Filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Search className="w-3.5 h-3.5 mr-1" />
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                      value={q}
                      onChange={(e) => {
                        setPage(1);
                        setQ(e.target.value);
                      }}
                      placeholder="Name or Employee ID..."
                    />
                  </div>
                </div>

                {/* Department Filter */}
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-medium text-slate-400">
                    <Building2 className="w-3.5 h-3.5 mr-1" />
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                      value={department}
                      onChange={(e) => {
                        setPage(1);
                        setDepartment(e.target.value);
                      }}
                      placeholder="IT, HR, Finance..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
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

          {/* Employees Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            {/* Card Header with Pagination */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Employee Records
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300">
                    {totalItems} total
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">Prev</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-slate-300">Page</span>
                    <span className="text-sm font-medium text-white px-2 py-1 rounded bg-slate-800">
                      {page}
                    </span>
                    <span className="text-sm text-slate-300">of</span>
                    <span className="text-sm font-medium text-white">
                      {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-800 border-t-green-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400">Loading employees...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No employees found
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {q || department
                    ? "Try adjusting your search filters to see more results."
                    : "Get started by adding your first employee to the directory."}
                </p>
                {(q || department) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Clear filters</span>
                  </button>
                )}
                {!q && !department && canWrite && (
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Employee</span>
                  </button>
                )}
              </div>
            ) : (
              /* Employees List */
              <div className="divide-y divide-slate-800">
                {items.map((emp) => (
                  <div
                    key={emp._id}
                    className="p-6 hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Employee Info */}
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-slate-800/80 rounded-lg mt-1">
                            <User className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-medium text-white">
                                {emp.fullName}
                              </h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
                                <IdCard className="w-3 h-3 mr-1" />
                                {emp.employeeId}
                              </span>
                              {!emp.isActive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/10 text-xs text-red-400 border border-red-500/30">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  inactive
                                </span>
                              )}
                              {emp.isActive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  active
                                </span>
                              )}
                            </div>

                            {/* Details Grid */}
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {emp.department && (
                                <span
                                  className={`inline-flex items-center text-sm px-2 py-1 rounded-md border ${getDepartmentColor(emp.department)}`}
                                >
                                  <Building2 className="w-3.5 h-3.5 mr-1.5" />
                                  {emp.department}
                                </span>
                              )}
                              {emp.title && (
                                <span className="flex items-center text-sm text-slate-400">
                                  <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                  {emp.title}
                                </span>
                              )}
                              {emp.email && (
                                <span className="flex items-center text-sm text-slate-400">
                                  <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                  {emp.email}
                                </span>
                              )}
                              {emp.phone && (
                                <span className="flex items-center text-sm text-slate-400">
                                  <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                  {emp.phone}
                                </span>
                              )}
                            </div>

                            {/* Created Date */}
                            <div className="mt-3 flex items-center text-xs text-slate-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              Added{" "}
                              {new Date(emp.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      {canWrite && (
                        <div className="lg:self-center">
                          <button
                            onClick={() => openEdit(emp)}
                            className="group flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all"
                          >
                            <Edit className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                            <span className="text-sm text-slate-300">Edit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Card Footer */}
            {!loading && items.length > 0 && (
              <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4 text-slate-500">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                      Active
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                      Inactive
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Showing {items.length} of {totalItems} employees
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-green-400">
                  Employee Management:
                </span>{" "}
                Employee IDs are automatically generated.
                {canWrite
                  ? " You have write access to create and edit employee records."
                  : " You have read-only access to view employee information."}
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
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        {editing ? (
                          <Edit className="w-5 h-5 text-green-400" />
                        ) : (
                          <Plus className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {editing ? "Edit Employee" : "Add New Employee"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {editing
                            ? `Employee ID: ${editing.employeeId}`
                            : "Employee ID will be auto-generated"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Modal Form */}
                <form onSubmit={save} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          type="email"
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Phone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Department
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                          value={dept}
                          onChange={(e) => setDept(e.target.value)}
                          placeholder="IT, HR, Finance..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Job Title
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Briefcase className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Software Engineer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center space-x-3">
                      {isActive ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-500" />
                      )}
                      <div>
                        <label
                          htmlFor="active-toggle"
                          className="text-sm font-medium text-slate-300"
                        >
                          Employee Status
                        </label>
                        <p className="text-xs text-slate-500">
                          {isActive ? "Active employee" : "Inactive (archived)"}
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
                      className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {editing ? "Update Employee" : "Create Employee"}
                      </span>
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
