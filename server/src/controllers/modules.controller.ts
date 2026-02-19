import type { Request, Response } from "express";
import { z } from "zod";
import { ModuleDef } from "../models/Module";
import { writeAudit } from "../utils/audit";

const createSchema = z.object({
  key: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  actions: z.array(z.string().min(1)).optional(),
});

const patchSchema = createSchema.partial();

export async function listModules(_req: Request, res: Response) {
  const items = await ModuleDef.find().sort({ name: 1 }).lean();
  res.json({ items });
}

export async function createModule(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const exists = await ModuleDef.findOne({ key: parsed.data.key }).lean();
  if (exists)
    return res.status(409).json({ message: "Module key already exists" });

  const created = await ModuleDef.create(parsed.data);

  await writeAudit({
    action: "MODULE_CREATE",
    module: "settings",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Module",
    entityId: String(created._id),
    summary: `Created module ${created.key}`,
    after: created.toObject(),
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.status(201).json({ module: created });
}

export async function patchModule(req: Request, res: Response) {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const doc = await ModuleDef.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  const before = doc.toObject();
  doc.set(parsed.data as any);
  await doc.save();
  const after = doc.toObject();

  await writeAudit({
    action: "MODULE_UPDATE",
    module: "settings",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Module",
    entityId: String(doc._id),
    summary: `Updated module ${doc.key}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ module: after });
}
