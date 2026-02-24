import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { apiFetchBlob } from "../lib/apiBlob";
import Layout from "../components/Layout";
import {
  Fingerprint,
  FileText,
  Printer,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Users,
  Building2,
  HardDrive,
  Edit,
  ArrowLeft,
  Info,
  History,
  Badge,
  UserPlus,
  FileSignature,
} from "lucide-react";

type NewStatus = "assigned" | "pending_hr_signature" | "signed" | "cancelled";

type Enrollment = {
  _id: string;
  docNumber: string;
  machineId: string;
  assigneeType: "employee" | "external";
  employeeId?: string;
  externalFullName?: string;
  externalDepartment?: string;
  externalIdNumber?: string;
  attendanceEmployeeNo: string;
  status: "assigned" | "pending_hr_signature" | "signed" | "cancelled";
  assignedAt: string;
  hrSignerName?: string;
  hrSignedAt?: string;
  hrRemarks?: string;
  itRemarks?: string;
  createdByUsername?: string;
};

type Machine = {
  machineCode: string;
  name: string;
  location: string;
  brand?: string;
  model?: string;
};

type Employee = {
  fullName: string;
  employeeId: string;
  department?: string;
};

type Event = {
  _id: string;
  type: "CREATE" | "STATUS_CHANGE" | "PRINT" | "UPDATE";
  note?: string;
  actorUsername?: string;
  createdAt: string;
};

export default function FingerprintEnrollmentDetail() {
  const { id } = useParams();

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Enrollment["status"]>(
    "pending_hr_signature",
  );
  const [note, setNote] = useState("");
  const [hrSignerName, setHrSignerName] = useState("");
  const [hrSignedDate, setHrSignedDate] = useState("");
  const [hrRemarks, setHrRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      const d = await apiFetch<{
        enrollment: Enrollment;
        machine: Machine | null;
        employee: Employee | null;
      }>(`/api/fingerprints/enrollments/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const ev = await apiFetch<{ items: Event[] }>(
        `/api/fingerprints/enrollments/${id}/events`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setEnrollment(d.enrollment);
      setMachine(d.machine);
      setEmployee(d.employee);
      setEvents(ev.items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load enrollment");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAll(); /* eslint-disable-next-line */
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  async function changeStatus() {
    if (!enrollment) return;
    setErr(null);
    setIsSubmitting(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        status: newStatus,
        note: note.trim() || undefined,
      };

      if (newStatus === "signed") {
        if (!hrSignerName.trim()) throw new Error("HR signer name is required");
        payload.hrSignerName = hrSignerName.trim();
        payload.hrSignedAt = hrSignedDate
          ? new Date(hrSignedDate).toISOString()
          : new Date().toISOString();
        payload.hrRemarks = hrRemarks.trim() || undefined;
      }

      await apiFetch(`/api/fingerprints/enrollments/${enrollment._id}/status`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      setStatusOpen(false);
      setNote("");
      await loadAll();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Status change failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function openPrint() {
    if (!enrollment) return;

    try {
      const blob = await apiFetchBlob(
        `/api/fingerprints/enrollments/${enrollment._id}/print`,
      );

      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");

      if (!tab) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${enrollment.docNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "PDF generation failed");
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <UserPlus className="w-5 h-5" />;
      case "pending_hr_signature":
        return <Clock className="w-5 h-5" />;
      case "signed":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Fingerprint className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "pending_hr_signature":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "signed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "CREATE":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case "STATUS_CHANGE":
        return <History className="w-4 h-4 text-amber-400" />;
      case "PRINT":
        return <Printer className="w-4 h-4 text-blue-400" />;
      case "UPDATE":
        return <Edit className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Loading enrollment details...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (err || !enrollment) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="rounded-xl border border-red-800/50 bg-gradient-to-br from-red-950/30 to-slate-950/30 p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-red-300">
                    Error Loading Enrollment
                  </h3>
                  <p className="mt-1 text-sm text-red-200">
                    {err || "Enrollment not found"}
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/fingerprints/enrollments"
              className="inline-flex items-center mt-6 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Enrollments
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const personName =
    enrollment.assigneeType === "employee"
      ? (employee?.fullName ?? "—")
      : (enrollment.externalFullName ?? "—");
  const dept =
    enrollment.assigneeType === "employee"
      ? (employee?.department ?? "")
      : (enrollment.externalDepartment ?? "");

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link and Refresh */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/fingerprints/enrollments"
              className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Enrollments
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm">Refresh</span>
            </button>
          </div>

          {/* Main Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden mb-6">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Enrollment Details
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openPrint}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/30"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="text-sm">Print PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewStatus("pending_hr_signature");
                      setStatusOpen(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Change Status</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Left Column - Main Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-slate-800/80 rounded-xl">
                      <FileText className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-white">
                          {enrollment.docNumber}
                        </h1>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(enrollment.status)}`}
                        >
                          {getStatusIcon(enrollment.status)}
                          <span className="ml-1">
                            {enrollment.status.replace(/_/g, " ")}
                          </span>
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">
                          {enrollment.assigneeType === "employee" ? (
                            <Users className="w-3 h-3 mr-1" />
                          ) : (
                            <User className="w-3 h-3 mr-1" />
                          )}
                          {enrollment.assigneeType}
                        </span>
                      </div>

                      {/* Person Info */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Person:</span>
                            <span className="ml-2 text-slate-300 font-medium">
                              {personName}
                            </span>
                          </div>
                          {dept && (
                            <div className="flex items-center text-sm">
                              <Building2 className="w-4 h-4 text-slate-500 mr-2" />
                              <span className="text-slate-400">
                                Department:
                              </span>
                              <span className="ml-2 text-slate-300">
                                {dept}
                              </span>
                            </div>
                          )}
                          {enrollment.assigneeType === "employee" &&
                            employee?.employeeId && (
                              <div className="flex items-center text-sm">
                                <Badge className="w-4 h-4 text-slate-500 mr-2" />
                                <span className="text-slate-400">
                                  Employee ID:
                                </span>
                                <span className="ml-2 text-slate-300 font-mono">
                                  {employee.employeeId}
                                </span>
                              </div>
                            )}
                          {enrollment.assigneeType === "external" &&
                            enrollment.externalIdNumber && (
                              <div className="flex items-center text-sm">
                                <Badge className="w-4 h-4 text-slate-500 mr-2" />
                                <span className="text-slate-400">
                                  ID Number:
                                </span>
                                <span className="ml-2 text-slate-300">
                                  {enrollment.externalIdNumber}
                                </span>
                              </div>
                            )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Badge className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">
                              Attendance No:
                            </span>
                            <span className="ml-2 text-slate-300 font-mono">
                              {enrollment.attendanceEmployeeNo}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Assigned:</span>
                            <span className="ml-2 text-slate-300">
                              {new Date(
                                enrollment.assignedAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-400">Created by:</span>
                            <span className="ml-2 text-slate-300">
                              {enrollment.createdByUsername || "system"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Machine Info */}
                      {machine && (
                        <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                          <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                            <HardDrive className="w-4 h-4 mr-1.5 text-slate-500" />
                            Assigned Machine
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center">
                              <span className="text-slate-400 w-20">Code:</span>
                              <span className="text-slate-300">
                                {machine.machineCode}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-slate-400 w-20">Name:</span>
                              <span className="text-slate-300">
                                {machine.name}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-slate-400 w-20">
                                Location:
                              </span>
                              <span className="text-slate-300">
                                {machine.location}
                              </span>
                            </div>
                            {(machine.brand || machine.model) && (
                              <div className="flex items-center">
                                <span className="text-slate-400 w-20">
                                  Model:
                                </span>
                                <span className="text-slate-300">
                                  {machine.brand} {machine.model}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* IT Remarks */}
                      {enrollment.itRemarks && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                            <Info className="w-4 h-4 mr-1.5 text-slate-500" />
                            IT Remarks
                          </h3>
                          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                            <p className="text-slate-300">
                              {enrollment.itRemarks}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* HR Signature Info */}
                      {enrollment.hrSignerName && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                            <FileSignature className="w-4 h-4 mr-1.5 text-slate-500" />
                            HR Signature
                          </h3>
                          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center">
                                <span className="text-slate-400 w-24">
                                  Signed by:
                                </span>
                                <span className="text-slate-300">
                                  {enrollment.hrSignerName}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-slate-400 w-24">
                                  Date:
                                </span>
                                <span className="text-slate-300">
                                  {enrollment.hrSignedAt
                                    ? new Date(
                                        enrollment.hrSignedAt,
                                      ).toLocaleDateString()
                                    : "—"}
                                </span>
                              </div>
                              {enrollment.hrRemarks && (
                                <div className="col-span-2">
                                  <span className="text-slate-400">
                                    Remarks:
                                  </span>
                                  <span className="ml-2 text-slate-300">
                                    {enrollment.hrRemarks}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {err && (
            <div className="mb-6 rounded-xl border border-red-800/50 bg-gradient-to-br from-red-950/30 to-slate-950/30 p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{err}</p>
              </div>
            </div>
          )}

          {/* Timeline Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">
                  Enrollment Timeline
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300">
                  Latest 100 events
                </span>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="p-12 text-center">
                <History className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No events recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {events.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-4 hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-slate-800 rounded-lg mt-0.5">
                        {getEventIcon(ev.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white">
                            {ev.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(ev.createdAt).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-400">
                            by {ev.actorUsername || "system"}
                          </span>
                        </div>
                        {ev.note && (
                          <p className="mt-1 text-sm text-slate-400">
                            {ev.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
              <div className="flex items-center text-xs text-slate-500">
                <Info className="w-3 h-3 mr-1 text-slate-600" />
                All status changes and print events are logged for audit
                purposes
              </div>
            </div>
          </div>

          {/* Status Change Modal */}
          {statusOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <History className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Change Status
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Update enrollment workflow status
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStatusOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      New Status
                    </label>
                    <select
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      value={newStatus}
                      onChange={(e) =>
                        setNewStatus(e.target.value as NewStatus)
                      }
                    >
                      <option value="assigned">Assigned</option>
                      <option value="pending_hr_signature">
                        Pending HR Signature
                      </option>
                      <option value="signed">Signed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {newStatus === "signed" && (
                    <div className="space-y-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">
                          HR Signer Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                          value={hrSignerName}
                          onChange={(e) => setHrSignerName(e.target.value)}
                          placeholder="e.g., Jane Smith, HR Manager"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-slate-300">
                            Signed Date
                          </label>
                          <input
                            type="date"
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            value={hrSignedDate}
                            onChange={(e) => setHrSignedDate(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-slate-300">
                            HR Remarks
                          </label>
                          <input
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            value={hrRemarks}
                            onChange={(e) => setHrRemarks(e.target.value)}
                            placeholder="Any additional notes"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Note (optional)
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note about this status change"
                    />
                  </div>

                  {/* Error Message */}
                  {err && (
                    <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-3">
                      <p className="text-sm text-red-300 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {err}
                      </p>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={changeStatus}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Update Status</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusOpen(false)}
                      className="px-6 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="border-t border-slate-800 bg-slate-900/40 px-6 py-3">
                  <div className="flex items-center text-xs text-slate-500">
                    <Info className="w-3 h-3 mr-1 text-slate-600" />
                    Status changes are recorded in the timeline with your
                    username
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
