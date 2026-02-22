import { getAccessToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function apiFetchBlob(path: string): Promise<Blob> {
  const token = getAccessToken();
  if (!token) throw new Error("No access token");

  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/pdf",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  return await res.blob();
}
