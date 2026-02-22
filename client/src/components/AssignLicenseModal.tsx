import { useEffect, useState } from "react";
import { fetchEmployeesMini, type EmployeeMini } from "../lib/employees";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";

export function AssignLicenseModal({
  licenseId,
  onClose,
  onDone,
}: {
  licenseId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [employees, setEmployees] = useState<EmployeeMini[]>([]);
  const [selected, setSelected] = useState("");
  const [seatCount, setSeatCount] = useState(1);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchEmployeesMini();
        setEmployees(list);
        if (list[0]?._id) setSelected(list[0]._id);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to load employees");
      }
    })();
  }, []);

  async function assign() {
    setErr(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");
      if (!selected) throw new Error("Select an employee");

      await apiFetch(`/api/licenses/${licenseId}/assign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          employeeId: selected,
          seatCount,
          note: note.trim() || undefined,
        }),
      });

      onDone();
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Assign failed");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Assign License</div>
            <div className="text-sm text-slate-400">This will use seats</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-slate-300">Employee</label>
            <select
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.fullName} ({e.employeeId})
                  {e.department ? ` - ${e.department}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Seat Count</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={seatCount}
                onChange={(e) =>
                  setSeatCount(parseInt(e.target.value || "1", 10))
                }
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Note</label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="optional"
              />
            </div>
          </div>

          {err && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
              {err}
            </div>
          )}

          <button
            onClick={assign}
            className="w-full rounded-xl bg-slate-100 text-slate-950 py-2 font-medium hover:opacity-90"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
