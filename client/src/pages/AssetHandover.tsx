/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import Layout from "../components/Layout";
import {
  FileText,
  Printer,
  User,
  Package,
  Plus,
  XCircle,
  AlertCircle,
  RefreshCw,
  Building2,
  HardDrive,
  Tag,
  FileSignature,
  Users,
  Info,
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

type Asset = {
  _id: string;
  assetTag: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  serialNumber?: string;
  status: "active" | "in-repair" | "retired";
  currentAssignment?: null | {
    assigneeType: "employee" | "external";
    employeeId?: string;
    assigneeName: string;
    assignedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

type ManualAssetRow = {
  id: string;
  assetTag: string;
  assetName: string;
  serialNumber: string;
};

type ExtraItem = { id: string; text: string };

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  return sp.toString();
}

function safeFirstName(fullName?: string) {
  const s = (fullName || "").trim();
  if (!s) return "—";
  return s.split(/\s+/)[0] || "—";
}

export default function AssetHandover() {
  // employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empMongoId, setEmpMongoId] = useState<string>("");
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // assets
  const [assignedAssets, setAssignedAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // memo fields
  const [fromTitle, setFromTitle] = useState("Junior Executive - IT");
  const [fromName, setFromName] = useState("Vidun Hettiarachchi");

  // manual additions
  const [manualAssets, setManualAssets] = useState<ManualAssetRow[]>([]);
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);

  // text blocks
  const bodyText =
    "Please acknowledge the receipt of following items, which is provided to you during your service at Sterling Steels (Pvt) Ltd.";

  const closingText =
    "It is your responsibility to use the above items in a manner and according to company ethics & to handover those in a good condition while leaving company role & responsibility.";

  const policyNote =
    "I have read, understood and acknowledge the company IT Policy. I will comply with the guidelines set out in the company IT Policy and understand that failure to do so might result in disciplinary or legal actions.";

  const [err, setErr] = useState<string | null>(null);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e._id === empMongoId) || null,
    [employees, empMongoId],
  );

  async function loadEmployees() {
    setEmployeesLoading(true);
    setErr(null);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token. Please login again.");

      const query = buildQuery({
        page: 1,
        limit: 100,
        isActive: true,
      });

      const data = await apiFetch<{
        totalPages: number;
        total: number;
        items: Employee[];
      }>(`/api/employees?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = (data.items || []).slice().sort((a, b) => {
        return (a.fullName || "").localeCompare(b.fullName || "");
      });

      setEmployees(list);

      if (!empMongoId) {
        const first = list[0];
        if (first?._id) setEmpMongoId(first._id);
      } else {
        const exists = list.some((x) => x._id === empMongoId);
        if (!exists) {
          const first = list[0];
          if (first?._id) setEmpMongoId(first._id);
        }
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load employees");
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  }

  async function loadAssetsForEmployee(employee: Employee) {
    setAssetsLoading(true);
    setErr(null);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token. Please login again.");

      const PAGE_LIMIT = 100;
      const MAX_PAGES = 20;
      let page = 1;

      const collected: Asset[] = [];

      while (page <= MAX_PAGES) {
        const query = buildQuery({ page, limit: PAGE_LIMIT });

        const data = await apiFetch<{
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          items: Asset[];
        }>(`/api/assets?${query}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const items = data.items || [];

        const assignedToEmployee = items.filter((a) => {
          const ca = a.currentAssignment;
          return (
            !!ca &&
            ca.assigneeType === "employee" &&
            !!ca.employeeId &&
            ca.employeeId === employee._id
          );
        });

        collected.push(...assignedToEmployee);

        if (page >= (data.totalPages || 1)) break;
        page += 1;
      }

      collected.sort((a, b) =>
        (a.assetTag || "").localeCompare(b.assetTag || ""),
      );

      setAssignedAssets(collected);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load assets");
      setAssignedAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;
    loadAssetsForEmployee(selectedEmployee);
  }, [selectedEmployee?._id]);

  function addManualRow() {
    setManualAssets((prev) => [
      ...prev,
      { id: uid(), assetTag: "", assetName: "", serialNumber: "" },
    ]);
  }

  function updateManualRow(
    id: string,
    key: keyof Omit<ManualAssetRow, "id">,
    val: string,
  ) {
    setManualAssets((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: val } : r)),
    );
  }

  function removeManualRow(id: string) {
    setManualAssets((prev) => prev.filter((r) => r.id !== id));
  }

  function addExtraItem() {
    setExtraItems((prev) => [...prev, { id: uid(), text: "" }]);
  }

  function updateExtraItem(id: string, text: string) {
    setExtraItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, text } : x)),
    );
  }

  function removeExtraItem(id: string) {
    setExtraItems((prev) => prev.filter((x) => x.id !== id));
  }

  function onPrint() {
    window.print();
  }

  const toLine = selectedEmployee
    ? `${selectedEmployee.fullName} (${selectedEmployee.employeeId})`.trim()
    : "—";

  const departmentLine = selectedEmployee?.department ?? "—";

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Print styling with proper page breaks */}
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 1.5cm;
            }
            
            body { 
              background: white !important; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .no-print { 
              display: none !important; 
            }
            
            .print-page { 
              padding: 0 !important; 
              margin: 0 !important;
              background: white !important;
            }
            
            .paper {
              border: none !important;
              background: white !important;
              box-shadow: none !important;
              padding: 0 !important;
              page-break-inside: avoid;
            }
            
            .paper * { 
              color: #000 !important; 
            }
            
            table {
              page-break-inside: auto;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            thead {
              display: table-header-group;
            }
            
            tfoot {
              display: table-footer-group;
            }
            
            .break-before {
              page-break-before: always;
            }
            
            .break-after {
              page-break-after: always;
            }
            
            .keep-together {
              page-break-inside: avoid;
            }
          }
        `}</style>

        {/* Builder controls */}
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <FileText className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Asset Handover Memorandum
                    </h1>
                    <p className="mt-2 text-slate-400 flex items-center">
                      <FileSignature className="w-4 h-4 mr-2 text-emerald-400" />
                      Generate and print asset handover forms for employees
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onPrint}
                className="group flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-green-500/30 transition-all"
              >
                <Printer className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">
                  Print Memorandum
                </span>
              </button>
            </div>
          </div>

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
              </div>
            </div>
          )}

          {/* Configuration Cards */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {/* Employee Selection Card */}
            <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
              <div className="border-b border-slate-800 bg-slate-900/40 px-5 py-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-medium text-white">
                    Employee Details
                  </h2>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Select Employee
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <select
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-200 appearance-none focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      value={empMongoId}
                      onChange={(e) => setEmpMongoId(e.target.value)}
                      disabled={employeesLoading || employees.length === 0}
                    >
                      {employeesLoading ? (
                        <option value="">Loading employees...</option>
                      ) : employees.length === 0 ? (
                        <option value="">No active employees</option>
                      ) : (
                        employees.map((e) => (
                          <option key={e._id} value={e._id}>
                            {e.fullName} ({e.employeeId})
                            {e.department ? ` - ${e.department}` : ""}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {selectedEmployee && (
                  <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Department</span>
                    </div>
                    <p className="text-sm text-slate-200">{departmentLine}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      From Title
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      value={fromTitle}
                      onChange={(e) => setFromTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      From Name
                    </label>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-sm text-slate-400">
                    Assigned Assets
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {assetsLoading ? (
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                    ) : null}
                    {assignedAssets.length} items
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Assets Card */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden">
              <div className="border-b border-slate-800 bg-slate-900/40 px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-medium text-white">
                      Manual Asset Entries
                    </h2>
                  </div>
                  <button
                    onClick={addManualRow}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Add Row</span>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {manualAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Package className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm text-slate-400">
                      No manual assets added
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click "Add Row" to include additional items
                    </p>
                  </div>
                ) : (
                  manualAssets.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-start gap-2 p-3 rounded-lg bg-slate-900/30 border border-slate-800"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          placeholder="Asset Tag"
                          value={r.assetTag}
                          onChange={(e) =>
                            updateManualRow(r.id, "assetTag", e.target.value)
                          }
                        />
                        <input
                          className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all col-span-1"
                          placeholder="Asset Name"
                          value={r.assetName}
                          onChange={(e) =>
                            updateManualRow(r.id, "assetName", e.target.value)
                          }
                        />
                        <div className="flex gap-2">
                          <input
                            className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            placeholder="Serial Number"
                            value={r.serialNumber}
                            onChange={(e) =>
                              updateManualRow(
                                r.id,
                                "serialNumber",
                                e.target.value,
                              )
                            }
                          />
                          <button
                            onClick={() => removeManualRow(r.id)}
                            className="p-2 rounded-lg border border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                            title="Remove row"
                          >
                            <XCircle className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Extra Items Card */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-950/50 overflow-hidden mb-8">
            <div className="border-b border-slate-800 bg-slate-900/40 px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-medium text-white">
                    Extra Additions
                  </h2>
                  <span className="text-xs text-slate-500">
                    (Accessories, peripherals, etc.)
                  </span>
                </div>
                <button
                  onClick={addExtraItem}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Add Item</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {extraItems.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-slate-500">No extra items added</p>
                </div>
              ) : (
                extraItems.map((x) => (
                  <div key={x.id} className="flex items-center gap-2">
                    <input
                      className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      placeholder="e.g., Laptop bag, Mouse, Charger, Dongle..."
                      value={x.text}
                      onChange={(e) => updateExtraItem(x.id, e.target.value)}
                    />
                    <button
                      onClick={() => removeExtraItem(x.id)}
                      className="p-2.5 rounded-lg border border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                      title="Remove item"
                    >
                      <XCircle className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preview Note */}
          <div className="flex items-center space-x-2 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <Info className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-slate-400">
              <span className="font-medium text-emerald-400">Preview:</span> The
              document below shows exactly how the memorandum will appear when
              printed on A4 paper.
            </p>
          </div>
        </div>

        {/* Print preview */}
        <div className="print-page px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="paper rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-10 shadow-2xl">
              {/* Letterhead with Company Logo */}
              <div className="text-center mb-8 keep-together">
                {/* Replace with your actual company logo */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-800 font-bold text-2xl">
                      SS
                    </span>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  STERLING STEELS
                </h1>
                <p className="text-sm text-slate-400">(Private) Limited</p>
                <div className="w-24 h-0.5 bg-emerald-500 mx-auto mt-3" />
              </div>

              {/* To/From Section - Keep together */}
              <div className="keep-together">
                <div className="grid grid-cols-2 gap-6 mb-8 p-5 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      TO
                    </p>
                    <p className="text-base font-semibold text-white">
                      {toLine}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {departmentLine}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      FROM
                    </p>
                    <p className="text-base font-semibold text-white">
                      {fromName}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">{fromTitle}</p>
                  </div>
                </div>
              </div>

              {/* Body Text - Keep together */}
              <div className="keep-together mb-8">
                <p className="text-slate-300 leading-relaxed">
                  Dear{" "}
                  <span className="font-semibold text-white">
                    {safeFirstName(selectedEmployee?.fullName)}
                  </span>
                  ,
                </p>
                <p className="text-slate-400 mt-3 leading-relaxed">
                  {bodyText}
                </p>
              </div>

              {/* Assets Table */}
              <div className="keep-together mb-8">
                <h2 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-emerald-400" />
                  Assigned Assets
                </h2>
                <div className="overflow-hidden rounded-lg border border-slate-800">
                  <table className="w-full">
                    <thead className="bg-slate-900/80">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Asset Tag
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Asset Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Serial Number
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {assignedAssets.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-sm text-slate-500"
                          >
                            No assets currently assigned
                          </td>
                        </tr>
                      ) : (
                        assignedAssets.map((a, idx) => (
                          <tr key={a._id} className="hover:bg-slate-900/30">
                            <td className="px-4 py-3 text-sm text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-white">
                              {a.assetTag}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-white">
                                {a.name}
                              </span>
                              <span className="text-xs text-slate-500 block">
                                {a.brand} {a.model}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                              {a.serialNumber || "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {assignedAssets.length > 0 && (
                  <p className="text-xs text-slate-600 mt-2">
                    * Current assigned assets only
                  </p>
                )}
              </div>

              {/* Manual Assets Table */}
              {manualAssets.filter(
                (r) => r.assetTag || r.assetName || r.serialNumber,
              ).length > 0 && (
                <div className="keep-together mb-8">
                  <h2 className="text-sm font-semibold text-white mb-3 flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-emerald-400" />
                    Additional Items
                  </h2>
                  <div className="overflow-hidden rounded-lg border border-slate-800">
                    <table className="w-full">
                      <thead className="bg-slate-900/80">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Asset Tag
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Asset Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Serial Number
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {manualAssets
                          .filter(
                            (r) => r.assetTag || r.assetName || r.serialNumber,
                          )
                          .map((r, idx) => (
                            <tr key={r.id} className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 text-sm text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3 text-sm text-white">
                                {r.assetTag || "—"}
                              </td>
                              <td className="px-4 py-3 text-sm text-white">
                                {r.assetName || "—"}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                                {r.serialNumber || "—"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Extra Items */}
              {extraItems.filter((x) => x.text.trim()).length > 0 && (
                <div className="keep-together mb-8">
                  <h2 className="text-sm font-semibold text-white mb-3 flex items-center">
                    <HardDrive className="w-4 h-4 mr-2 text-emerald-400" />
                    Accessories
                  </h2>
                  <ul className="space-y-2">
                    {extraItems
                      .filter((x) => x.text.trim())
                      .map((x) => (
                        <li
                          key={x.id}
                          className="flex items-center text-sm text-slate-300"
                        >
                          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3" />
                          {x.text.trim()}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Closing Text */}
              <div className="keep-together mb-8 p-5 rounded-lg bg-slate-900/50 border border-slate-800">
                <p className="text-sm text-slate-400 leading-relaxed">
                  {closingText}
                </p>
              </div>

              {/* Policy Note */}
              <div className="keep-together mb-8 p-5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-sm font-medium text-emerald-400 mb-2">
                  Policy Acknowledgment
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {policyNote}
                </p>
              </div>

              {/* Signature Fields - Keep together */}
              <div className="keep-together">
                <div className="grid grid-cols-2 gap-8 mt-10">
                  <div>
                    <div className="border-b border-slate-700 pb-2 mb-2">
                      <div className="h-8" />
                    </div>
                    <p className="text-sm text-slate-400">Employee Signature</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-700 pb-2 mb-2">
                      <div className="h-8" />
                    </div>
                    <p className="text-sm text-slate-400">Date</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-600">
                  Sterling is a trademark of Sterling Steels Private Limited
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
