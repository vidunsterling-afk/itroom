import type { Request, Response } from "express";
import { z } from "zod";
import { FingerprintMachine } from "../models/FingerprintMachine";
import { writeAudit } from "../utils/audit";

const createSchema = z.object({
  machineCode: z.string().min(2),
  name: z.string().min(2),
  location: z.string().min(2),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  deviceId: z.string().optional(),
  ipAddress: z.string().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

const patchSchema = createSchema.partial().omit({ machineCode: true });

export async function listFingerprintMachines(req: Request, res: Response) {
  const q = (req.query.q as string | undefined)?.trim();
  const filter: any = {};

  if (q) {
    filter.$or = [
      { machineCode: { $regex: q, $options: "i" } },
      { name: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { brand: { $regex: q, $options: "i" } },
      { model: { $regex: q, $options: "i" } },
    ];
  }

  const items = await FingerprintMachine.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  res.json({ items });
}

export async function createFingerprintMachine(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const exists = await FingerprintMachine.findOne({
    machineCode: parsed.data.machineCode.trim(),
  }).lean();
  if (exists)
    return res.status(409).json({ message: "Machine code already exists" });

  const created = await FingerprintMachine.create({
    ...parsed.data,
    machineCode: parsed.data.machineCode.trim(),
    name: parsed.data.name.trim(),
    location: parsed.data.location.trim(),
    brand: parsed.data.brand?.trim(),
    model: parsed.data.model?.trim(),
    notes: parsed.data.notes?.trim(),
  });

  await writeAudit({
    action: "FP_MACHINE_CREATE",
    module: "fingerprints",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "FingerprintMachine",
    entityId: String(created._id),
    summary: `Created fingerprint machine ${created.machineCode}`,
    after: created.toObject(),
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.status(201).json({ machine: created });
}

export async function patchFingerprintMachine(req: Request, res: Response) {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const doc = await FingerprintMachine.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  const before = doc.toObject();
  doc.set(parsed.data as any);
  await doc.save();
  const after = doc.toObject();

  await writeAudit({
    action: "FP_MACHINE_UPDATE",
    module: "fingerprints",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "FingerprintMachine",
    entityId: String(doc._id),
    summary: `Updated fingerprint machine ${doc.machineCode}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ machine: after });
}
