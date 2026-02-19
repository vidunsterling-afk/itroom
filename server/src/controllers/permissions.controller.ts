import type { Request, Response } from "express";
import { z } from "zod";
import { Permission } from "../models/Permission";
import { ModuleDef } from "../models/Module";
import { invalidatePermCache } from "../utils/permCache";
import { writeAudit } from "../utils/audit";

export async function listStaffPermissions(_req: Request, res: Response) {
  const [modules, perms] = await Promise.all([
    ModuleDef.find({ isActive: true }).sort({ name: 1 }).lean(),
    Permission.find({ role: "staff" }).lean(),
  ]);

  const map = new Map(perms.map((p) => [p.moduleKey, p.actions]));
  const items = modules.map((m) => ({
    moduleKey: m.key,
    moduleName: m.name,
    availableActions: m.actions,
    staffActions: map.get(m.key) ?? [],
  }));

  res.json({ items });
}

const upsertSchema = z.object({
  moduleKey: z.string().min(2),
  actions: z.array(z.string().min(1)),
});

export async function upsertStaffPermission(req: Request, res: Response) {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const mod = await ModuleDef.findOne({ key: parsed.data.moduleKey }).lean();
  if (!mod) return res.status(400).json({ message: "Unknown moduleKey" });

  // keep only actions that the module supports
  const allowed = new Set(mod.actions ?? []);
  const cleanActions = Array.from(new Set(parsed.data.actions)).filter((a) =>
    allowed.has(a),
  );

  const before = await Permission.findOne({
    role: "staff",
    moduleKey: parsed.data.moduleKey,
  }).lean();

  const after = await Permission.findOneAndUpdate(
    { role: "staff", moduleKey: parsed.data.moduleKey },
    { $set: { actions: cleanActions } },
    { upsert: true, new: true },
  ).lean();

  invalidatePermCache(parsed.data.moduleKey);

  await writeAudit({
    action: "PERMISSION_SET",
    module: "settings",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Permission",
    entityId: `${after?.role}:${after?.moduleKey}`,
    summary: `Set staff permissions for ${parsed.data.moduleKey}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ permission: after });
}
