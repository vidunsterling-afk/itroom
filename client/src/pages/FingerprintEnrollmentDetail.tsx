import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import { apiFetchBlob } from "../lib/apiBlob";

type NewStatus = "assigned" | "pending_hr_signature";

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
type Employee = { fullName: string; employeeId: string; department?: string };

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

  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Enrollment["status"]>(
    "pending_hr_signature",
  );
  const [note, setNote] = useState("");
  const [hrSignerName, setHrSignerName] = useState("");
  const [hrSignedDate, setHrSignedDate] = useState(""); // yyyy-mm-dd
  const [hrRemarks, setHrRemarks] = useState("");

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
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(); /* eslint-disable-next-line */
  }, [id]);

  async function changeStatus() {
    if (!enrollment) return;
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        status: newStatus,
        note: note.trim() || undefined,
      };

      if (newStatus === "signed") {
        if (!hrSignerName.trim()) throw new Error("HR signer name required");
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
    }
  }

  async function openPrint() {
    if (!enrollment) return;

    try {
      const blob = await apiFetchBlob(
        `/api/fingerprints/enrollments/${enrollment._id}/print`,
      );

      const url = URL.createObjectURL(blob);

      // open in new tab
      const tab = window.open(url, "_blank");

      // if popup blocked, fallback to download
      if (!tab) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${enrollment.docNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      // cleanup (delay so tab can load)
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "PDF print failed");
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        Loading...
      </div>
    );

  if (err) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-200">
            {err}
          </div>
          <Link
            to="/fingerprints/enrollments"
            className="inline-block mt-4 text-slate-300 hover:underline"
          >
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  if (!enrollment) return null;

  const personName =
    enrollment.assigneeType === "employee"
      ? (employee?.fullName ?? "—")
      : (enrollment.externalFullName ?? "—");
  const dept =
    enrollment.assigneeType === "employee"
      ? (employee?.department ?? "")
      : (enrollment.externalDepartment ?? "");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/fingerprints/enrollments"
          className="text-slate-300 hover:underline"
        >
          ← Back to Enrollments
        </Link>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold">
                  {enrollment.docNumber}
                </h1>
                <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                  {enrollment.status}
                </span>
                <span className="text-xs rounded-lg border border-slate-800 px-2 py-1 text-slate-300">
                  {enrollment.assigneeType}
                </span>
              </div>

              <div className="mt-2 text-sm text-slate-400">
                Attendance No:{" "}
                <span className="text-slate-200">
                  {enrollment.attendanceEmployeeNo}
                </span>{" "}
                • Assigned{" "}
                {new Date(enrollment.assignedAt).toLocaleDateString()} • By{" "}
                <span className="text-slate-200">
                  {enrollment.createdByUsername ?? "—"}
                </span>
              </div>

              <div className="mt-3 text-sm text-slate-300">
                Person: <span className="text-slate-100">{personName}</span>
                {dept ? (
                  <span className="text-slate-500"> • {dept}</span>
                ) : null}
                {enrollment.assigneeType === "employee" ? (
                  <span className="text-slate-500">
                    {" "}
                    • {employee?.employeeId ?? "—"}
                  </span>
                ) : enrollment.externalIdNumber ? (
                  <span className="text-slate-500">
                    {" "}
                    • {enrollment.externalIdNumber}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 text-sm text-slate-300">
                Machine:{" "}
                <span className="text-slate-100">
                  {machine?.machineCode ?? "—"}
                </span>
                <span className="text-slate-500">
                  {" "}
                  • {machine?.name ?? "—"} • {machine?.location ?? "—"}
                </span>
              </div>

              {enrollment.itRemarks && (
                <div className="mt-3 text-sm text-slate-300">
                  {enrollment.itRemarks}
                </div>
              )}

              <div className="mt-3 text-sm text-slate-400">
                HR Sign:{" "}
                <span className="text-slate-200">
                  {enrollment.hrSignerName ?? "—"}
                </span>{" "}
                • Date:{" "}
                <span className="text-slate-200">
                  {enrollment.hrSignedAt
                    ? new Date(enrollment.hrSignedAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={openPrint}
                className="rounded-xl bg-slate-100 text-slate-950 px-4 py-2 font-medium hover:opacity-90"
              >
                Print PDF
              </button>
              <button
                onClick={() => {
                  setNewStatus("pending_hr_signature");
                  setStatusOpen(true);
                }}
                className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
              >
                Change Status
              </button>
            </div>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-200">
            {err}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
            Timeline (latest 100)
          </div>
          {events.length === 0 ? (
            <div className="p-4 text-slate-400">No events</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {events.map((ev) => (
                <div key={ev._id} className="p-4 hover:bg-slate-900/30">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-200 font-medium">
                      {ev.type}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-sm">
                      • {ev.actorUsername ?? "system"}
                    </span>
                  </div>
                  {ev.note && (
                    <div className="mt-1 text-sm text-slate-300">{ev.note}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {statusOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Change Status</div>
                  <div className="text-sm text-slate-400">
                    This will be recorded in timeline + audit
                  </div>
                </div>
                <button
                  onClick={() => setStatusOpen(false)}
                  className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-300">Status</label>
                  <select
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as NewStatus)}
                  >
                    <option value="assigned">assigned</option>
                    <option value="pending_hr_signature">
                      pending_hr_signature
                    </option>
                    <option value="signed">signed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>

                {newStatus === "signed" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-300">
                        HR Signer Name *
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                        value={hrSignerName}
                        onChange={(e) => setHrSignerName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-sm text-slate-300">
                          HR Signed Date
                        </label>
                        <input
                          type="date"
                          className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                          value={hrSignedDate}
                          onChange={(e) => setHrSignedDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-300">
                          HR Remarks
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                          value={hrRemarks}
                          onChange={(e) => setHrRemarks(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-slate-300">Note</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="optional"
                  />
                </div>

                <button
                  onClick={changeStatus}
                  className="w-full rounded-xl bg-slate-100 text-slate-950 py-2 font-medium hover:opacity-90"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
