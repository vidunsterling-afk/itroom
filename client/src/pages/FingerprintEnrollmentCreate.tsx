import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { fetchEmployeesMini, type EmployeeMini } from "../lib/employees";
import Layout from "../components/Layout";

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
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      if (!machineId) throw new Error("Select a machine");
      if (!attendanceEmployeeNo.trim())
        throw new Error("Attendance employee number required");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        machineId,
        assigneeType,
        attendanceEmployeeNo: attendanceEmployeeNo.trim(),
        status,
        itRemarks: itRemarks.trim() || undefined,
      };

      if (assigneeType === "employee") {
        if (!employeeId) throw new Error("Select employee");
        payload.employeeId = employeeId;
      } else {
        if (!externalFullName.trim())
          throw new Error("External full name required");
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
      setErr(e instanceof Error ? e.message : "Create failed");
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-semibold">New Fingerprint Enrollment</h1>
          <p className="text-slate-400 mt-1">
            Record IT enrollment + generate HR signature form
          </p>

          <form
            onSubmit={submit}
            className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4"
          >
            <div>
              <label className="text-sm text-slate-300">Machine *</label>
              <select
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
              >
                {machines.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.machineCode} • {m.name} • {m.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Assignee Type</label>
              <select
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={assigneeType}
                onChange={(e) =>
                  setAssigneeType(e.target.value as AssigneeType)
                }
              >
                <option value="employee">employee (in system)</option>
                <option value="external">external (not in system)</option>
              </select>
            </div>

            {assigneeType === "employee" ? (
              <div>
                <label className="text-sm text-slate-300">Employee *</label>
                <select
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                >
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.fullName} ({e.employeeId})
                      {e.department ? ` - ${e.department}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-300">Full Name *</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                    value={externalFullName}
                    onChange={(e) => setExternalFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-slate-300">Department</label>
                    <input
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                      value={externalDepartment}
                      onChange={(e) => setExternalDepartment(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">NIC/ID</label>
                    <input
                      className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                      value={externalIdNumber}
                      onChange={(e) => setExternalIdNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-slate-300">
                Attendance Employee No (manual) *
              </label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={attendanceEmployeeNo}
                onChange={(e) => setAttendanceEmployeeNo(e.target.value)}
                placeholder="HR biometric number"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Initial Status</label>
              <select
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="assigned">assigned</option>
                <option value="pending_hr_signature">
                  pending_hr_signature
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">IT Remarks</label>
              <textarea
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 min-h-[90px]"
                value={itRemarks}
                onChange={(e) => setItRemarks(e.target.value)}
              />
            </div>

            {err && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                {err}
              </div>
            )}

            <button className="w-full rounded-xl bg-slate-100 text-slate-950 py-2 font-medium hover:opacity-90">
              Create Enrollment
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
