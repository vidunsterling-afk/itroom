import { apiFetch } from "./api";
import { getAccessToken } from "./auth";

export type EmployeeMini = {
  _id: string;
  employeeId: string;
  fullName: string;
  department?: string;
  isActive: boolean;
};

export async function fetchEmployeesMini(q?: string) {
  const token = getAccessToken();
  if (!token) throw new Error("No access token");

  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  params.set("page", "1");
  params.set("limit", "50");

  const data = await apiFetch<{ items: EmployeeMini[] }>(
    `/api/employees?${params.toString()}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // prefer active only
  return data.items.filter((e) => e.isActive);
}
