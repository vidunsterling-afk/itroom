import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { fetchEmployeesMini, type EmployeeMini } from "../lib/employees";
import Layout from "../components/Layout";
import {
  Fingerprint,
  Save,
  AlertCircle,
  Info,
  User,
  Users,
  Building2,
  HardDrive,
  FileText,
  HelpCircle,
  ArrowLeft,
  Badge,
  Clock,
} from "lucide-react";

type Status = "assigned" | "pending_hr_signature";
type AssigneeType = "employee" | "external";

type Machine = {
  _id: string;
  machineCode: string;
  name: string;
  location: string;
  isActive: boolean;
};

export default function FingerprintEnrollmentCreate() {
  const nav = useNavigate();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [employees, setEmployees] = useState<EmployeeMini[]>([]);

  const [machineId, setMachineId] = useState("");
  const [assigneeType, setAssigneeType] = useState<"employee" | "external">(
    "employee",
  );

  const [employeeId, setEmployeeId] = useState("");
  const [externalFullName, setExternalFullName] = useState("");
  const [externalDepartment, setExternalDepartment] = useState("");
  const [externalIdNumber, setExternalIdNumber] = useState("");

  const [attendanceEmployeeNo, setAttendanceEmployeeNo] = useState("");
  const [status, setStatus] = useState<"assigned" | "pending_hr_signature">(
    "assigned",
  );
  const [itRemarks, setItRemarks] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = getAccessToken();
        if (!token) throw new Error("No access token");

        const m = await apiFetch<{ items: Machine[] }>(
          "/api/fingerprints/machines",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const active = (m.items ?? []).filter((x) => x.isActive);
        setMachines(active);
        if (active[0]?._id) setMachineId(active[0]._id);

        const emps = await fetchEmployeesMini();
        setEmployees(emps);
        if (emps[0]?._id) setEmployeeId(emps[0]._id);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsSubmitting(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      if (!machineId) throw new Error("Please select a machine");
      if (!attendanceEmployeeNo.trim())
        throw new Error("Attendance employee number is required");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        machineId,
        assigneeType,
        attendanceEmployeeNo: attendanceEmployeeNo.trim(),
        status,
        itRemarks: itRemarks.trim() || undefined,
      };

      if (assigneeType === "employee") {
        if (!employeeId) throw new Error("Please select an employee");
        payload.employeeId = employeeId;
      } else {
        if (!externalFullName.trim())
          throw new Error("External full name is required");
        payload.externalFullName = externalFullName.trim();
        payload.externalDepartment = externalDepartment.trim() || undefined;
        payload.externalIdNumber = externalIdNumber.trim() || undefined;
      }

      const created = await apiFetch<{ enrollment: { _id: string } }>(
        "/api/fingerprints/enrollments",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        },
      );

      nav(`/fingerprints/enrollments/${created.enrollment._id}`, {
        replace: true,
      });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create enrollment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <div className="mb-6">
            <Link
              to="/fingerprints/enrollments"
              className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Enrollments
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Fingerprint className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  New Fingerprint Enrollment
                </h1>
                <p className="mt-2 text-slate-400 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-indigo-400" />
                  Record IT enrollment and generate HR signature form
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Loading form data...
              </p>
            </div>
          ) : (
            /* Main Form Card */
            <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
              {/* Card Header */}
              <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Enrollment Details
                  </h2>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={submit} className="p-6 space-y-5">
                {/* Machine Selection */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Machine <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HardDrive className="h-4 w-4 text-slate-500" />
                    </div>
                    <select
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 appearance-none focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      value={machineId}
                      onChange={(e) => setMachineId(e.target.value)}
                      required
                    >
                      <option value="">Select a machine</option>
                      {machines.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.machineCode} • {m.name} • {m.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assignee Type */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Assignee Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {assigneeType === "employee" ? (
                        <Users className="h-4 w-4 text-slate-500" />
                      ) : (
                        <User className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    <select
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 appearance-none focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      value={assigneeType}
                      onChange={(e) =>
                        setAssigneeType(e.target.value as AssigneeType)
                      }
                    >
                      <option value="employee">Employee (in system)</option>
                      <option value="external">External (not in system)</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Fields based on Assignee Type */}
                {assigneeType === "employee" ? (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Employee <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-4 w-4 text-slate-500" />
                      </div>
                      <select
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 appearance-none focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        required
                      >
                        <option value="">Select an employee</option>
                        {employees.map((e) => (
                          <option key={e._id} value={e._id}>
                            {e.fullName} ({e.employeeId})
                            {e.department ? ` - ${e.department}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                          value={externalFullName}
                          onChange={(e) => setExternalFullName(e.target.value)}
                          placeholder="e.g., John Smith"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">
                          Department
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building2 className="h-4 w-4 text-slate-500" />
                          </div>
                          <input
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            value={externalDepartment}
                            onChange={(e) =>
                              setExternalDepartment(e.target.value)
                            }
                            placeholder="e.g., Consulting"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">
                          NIC/ID Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Badge className="h-4 w-4 text-slate-500" />
                          </div>
                          <input
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            value={externalIdNumber}
                            onChange={(e) =>
                              setExternalIdNumber(e.target.value)
                            }
                            placeholder="e.g., ID-12345"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attendance Employee Number */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Attendance Employee No{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Badge className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      value={attendanceEmployeeNo}
                      onChange={(e) => setAttendanceEmployeeNo(e.target.value)}
                      placeholder="e.g., EMP-001"
                      required
                    />
                  </div>
                  <p className="flex items-center text-xs text-slate-500 mt-1.5">
                    <HelpCircle className="w-3 h-3 mr-1 text-slate-600" />
                    This is the number used in the biometric system
                  </p>
                </div>

                {/* Initial Status */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Initial Status
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-slate-500" />
                    </div>
                    <select
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-slate-200 appearance-none focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Status)}
                    >
                      <option value="assigned">Assigned</option>
                      <option value="pending_hr_signature">
                        Pending HR Signature
                      </option>
                    </select>
                  </div>
                </div>

                {/* IT Remarks */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    IT Remarks
                  </label>
                  <textarea
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all min-h-[100px]"
                    value={itRemarks}
                    onChange={(e) => setItRemarks(e.target.value)}
                    placeholder="Any additional notes about this enrollment..."
                  />
                </div>

                {/* Error Message */}
                {err && (
                  <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">{err}</p>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Create Enrollment</span>
                      </>
                    )}
                  </button>
                  <Link
                    to="/fingerprints/enrollments"
                    className="px-6 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors flex items-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* Help Note */}
          <div className="mt-6 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="font-medium text-indigo-400">
                  Enrollment Process:
                </span>{" "}
                After creation, you can print the HR signature form and update
                the status as the enrollment progresses through the workflow.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
