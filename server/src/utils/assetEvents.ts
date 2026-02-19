import { AssetEvent } from "../models/AssetEvent";

const SENSITIVE_KEYS = new Set(["password", "passwordHash"]);

function sanitize(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(k)) continue;
    out[k] = sanitize(v);
  }
  return out;
}

export async function writeAssetEvent(input: {
  assetId: string;
  type: "ASSIGN" | "UNASSIGN" | "STATUS_CHANGE" | "UPDATE_DETAILS";
  before?: any;
  after?: any;
  note?: string;
  actorUserId?: string;
  actorUsername?: string;
}) {
  await AssetEvent.create({
    ...input,
    before: sanitize(input.before),
    after: sanitize(input.after),
  });
}
