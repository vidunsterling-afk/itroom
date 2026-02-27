// utils/emailLogger.ts
import { EmailLogModel } from "../models/EmailLog";

function asArray(v?: string | string[]): string[] {
  if (!v) return [];
  if (Array.isArray(v))
    return v
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function logEmailSent(input: {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  module?: string;
  entityType?: string;
  entityId?: string;
}) {
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  await EmailLogModel.create({
    to: asArray(input.to),
    cc: asArray(input.cc),
    subject: input.subject,
    status: "SENT",
    module: input.module,
    entityType: input.entityType,
    entityId: input.entityId,
    expiresAt,
  });
}

export async function logEmailFailed(input: {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  error: string;
  module?: string;
  entityType?: string;
  entityId?: string;
}) {
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  await EmailLogModel.create({
    to: asArray(input.to),
    cc: asArray(input.cc),
    subject: input.subject,
    status: "FAILED",
    error: input.error,
    module: input.module,
    entityType: input.entityType,
    entityId: input.entityId,
    expiresAt,
  });
}

// ✅ ADD ONLY (doesn't change existing funcs)
export async function logEmailSkipped(input: {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  module?: string;
  entityType?: string;
  entityId?: string;
}) {
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  await EmailLogModel.create({
    to: asArray(input.to),
    cc: asArray(input.cc),
    subject: input.subject,
    status: "SKIPPED", // or "DISABLED" if you prefer
    module: input.module,
    entityType: input.entityType,
    entityId: input.entityId,
    expiresAt,
  });
}
