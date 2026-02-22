// components/AssignEmployeeModal.tsx
import { useEffect, useState } from "react";
import { fetchEmployeesMini, type EmployeeMini } from "../lib/employees";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import {
  XCircle,
  AlertCircle,
  UserPlus,
  Search,
  Users,
  FileText,
  CheckCircle,
  Building2,
  Info,
  RefreshCw,
} from "lucide-react";

export function AssignEmployeeModal({
  assetId,
  onClose,
  onDone,
}: {
  assetId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [q, setQ] = useState("");
  const [employees, setEmployees] = useState<EmployeeMini[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load(searchQuery = q) {
    setLoading(true);
    setErr(null);
    try {
      const list = await fetchEmployeesMini(searchQuery);
      setEmployees(list);
      if (!selected && list[0]?._id) setSelected(list[0]._id);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load employees");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setSearching(true);
    load(q);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  async function assign() {
    setErr(null);
    setIsSubmitting(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token");

      if (!selected) throw new Error("Please select an employee");

      await apiFetch(`/api/assets/${assetId}/assign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assigneeType: "employee",
          employeeId: selected,
          note: note.trim() || undefined,
        }),
      });

      onDone();
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Assignment failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedEmployee = employees.find((e) => e._id === selected);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Assign Asset
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an employee to assign this asset to
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <XCircle className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Search Section */}
          <div className="space-y-1.5">
            <label className="flex items-center text-sm font-medium text-slate-300">
              <Search className="w-4 h-4 mr-1.5 text-slate-500" />
              Search Employees
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Name or Employee ID..."
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-all disabled:opacity-50"
              >
                {searching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="text-sm">Find</span>
              </button>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center text-sm font-medium text-slate-300">
              <Users className="w-4 h-4 mr-1.5 text-slate-500" />
              Select Employee <span className="text-red-400 ml-1">*</span>
            </label>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <div className="w-8 h-8 border-3 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
                </div>
              </div>
            ) : employees.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-slate-800 bg-slate-900/50">
                <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No employees found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {employees.map((e) => (
                  <button
                    key={e._id}
                    type="button"
                    onClick={() => setSelected(e._id)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      selected === e._id
                        ? "bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/50"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-white">
                            {e.fullName}
                          </span>
                          <span className="ml-2 text-xs font-mono text-slate-500">
                            ({e.employeeId})
                          </span>
                        </div>
                        <div className="flex items-center mt-1 space-x-2 text-xs">
                          {e.department && (
                            <span className="flex items-center text-slate-400">
                              <Building2 className="w-3 h-3 mr-1" />
                              {e.department}
                            </span>
                          )}
                        </div>
                      </div>
                      {selected === e._id && (
                        <CheckCircle className="w-5 h-5 text-blue-400 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Employee Summary */}
          {selectedEmployee && (
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Selected employee</p>
              <div className="flex items-center">
                <div className="p-1.5 bg-blue-500/10 rounded-lg mr-2">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {selectedEmployee.fullName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedEmployee.employeeId}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Note Field */}
          <div className="space-y-1.5">
            <label className="flex items-center text-sm font-medium text-slate-300">
              <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
              Note (optional)
            </label>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Issued new laptop for remote work"
            />
            <p className="flex items-center text-xs text-slate-500 mt-1.5">
              <Info className="w-3 h-3 mr-1 text-slate-600" />
              This note will be recorded in the assignment history
            </p>
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
          <div className="flex space-x-3 pt-2">
            <button
              onClick={assign}
              disabled={isSubmitting || !selected || loading}
              className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Asset</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
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
            Assignments are logged in the asset timeline and employee history
          </div>
        </div>
      </div>
    </div>
  );
}
