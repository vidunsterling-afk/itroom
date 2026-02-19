const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });

  // parse json
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (data && (data.message as string)) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
