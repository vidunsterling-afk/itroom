import { Permission } from "../models/Permission";

type CacheEntry = { actions: Set<string>; expiresAt: number };
const cache = new Map<string, CacheEntry>(); // key = `${role}:${moduleKey}`
const TTL_MS = 30_000;

export async function getStaffActions(moduleKey: string): Promise<Set<string>> {
  const key = `staff:${moduleKey}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.actions;

  const doc = await Permission.findOne({ role: "staff", moduleKey }).lean();
  const actions = new Set(doc?.actions ?? []);
  cache.set(key, { actions, expiresAt: now + TTL_MS });
  return actions;
}

export function invalidatePermCache(moduleKey?: string) {
  if (!moduleKey) return cache.clear();
  cache.delete(`staff:${moduleKey}`);
}
