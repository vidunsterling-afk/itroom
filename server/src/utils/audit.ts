import { AuditLog } from "../models/AuditLog";

type AuditInput = {
  actorUserId?: string;
  actorUsername?: string;
  action: string;
  module: string;
  status: "SUCCESS" | "FAIL";
  entityType?: string;
  entityId?: string;
  summary?: string;
  before?: any;
  after?: any;
  ip?: string;
  userAgent?: string;
};

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

export async function writeAudit(input: AuditInput) {
  await AuditLog.create({
    ...input,
    before: sanitize(input.before),
    after: sanitize(input.after),
  });
}
