import { apiFetch } from "./api";

export type Role = "admin" | "auditor" | "staff";
export type MeUser = { sub: string; username: string; role: Role };

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function login(identifier: string, password: string) {
  const data = await apiFetch<{
    accessToken: string;
    user: { id: string; username: string; email: string; role: Role };
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });

  setAccessToken(data.accessToken);
  return data.user;
}

export async function logout() {
  await apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" });
  setAccessToken(null);
}

export async function refresh() {
  const data = await apiFetch<{ accessToken: string }>("/api/auth/refresh", {
    method: "POST",
  });
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function me(): Promise<{ user: MeUser }> {
  const token = getAccessToken();
  if (!token) throw new Error("No access token");

  return apiFetch<{ user: MeUser }>("/api/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
