import type { Request, Response } from "express";
import { z } from "zod";
import { License } from "../models/License";
import { writeAudit } from "../utils/audit";

const listSchema = z.object({
  q: z.string().optional(),
  vendor: z.string().optional(),
  type: z.enum(["subscription", "perpetual"]).optional(),
  active: z.coerce.boolean().optional(),
  expiringInDays: z.coerce.number().int().min(1).max(365).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const createSchema = z.object({
  key: z.string().min(2),
  name: z.string().min(2),
  vendor: z.string().min(2),
  type: z.enum(["subscription", "perpetual"]),
  seatsTotal: z.number().int().min(0),
  expiresAt: z.string().datetime().optional(),
  renewalAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

const patchSchema = createSchema.partial().omit({ key: true });

export async function listLicenses(req: Request, res: Response) {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid query" });

  const { q, vendor, type, active, expiringInDays, page, limit } = parsed.data;

  const filter: any = {};
  if (vendor) filter.vendor = vendor;
  if (type) filter.type = type;
  if (typeof active === "boolean") filter.isActive = active;

  if (q?.trim()) {
    const s = q.trim();
    filter.$or = [
      { key: { $regex: s, $options: "i" } },
      { name: { $regex: s, $options: "i" } },
      { vendor: { $regex: s, $options: "i" } },
    ];
  }

  if (expiringInDays) {
    const now = new Date();
    const to = new Date(Date.now() + expiringInDays * 24 * 60 * 60 * 1000);
    filter.expiresAt = { $gte: now, $lte: to };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    License.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select({
        key: 1,
        name: 1,
        vendor: 1,
        type: 1,
        seatsTotal: 1,
        seatsUsed: 1,
        expiresAt: 1,
        renewalAt: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean(),
    License.countDocuments(filter),
  ]);

  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
}

export async function getLicense(req: Request, res: Response) {
  const doc = await License.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json({ license: doc });
}

export async function createLicense(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const exists = await License.findOne({ key: parsed.data.key }).lean();
  if (exists)
    return res.status(409).json({ message: "License key already exists" });

  const created = await License.create({
    key: parsed.data.key.trim(),
    name: parsed.data.name.trim(),
    vendor: parsed.data.vendor.trim(),
    type: parsed.data.type,
    seatsTotal: parsed.data.seatsTotal,
    seatsUsed: 0,
    expiresAt: parsed.data.expiresAt
      ? new Date(parsed.data.expiresAt)
      : undefined,
    renewalAt: parsed.data.renewalAt
      ? new Date(parsed.data.renewalAt)
      : undefined,
    notes: parsed.data.notes,
    isActive: parsed.data.isActive ?? true,
  });

  await writeAudit({
    action: "LICENSE_CREATE",
    module: "licenses",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "License",
    entityId: String(created._id),
    summary: `Created license ${created.key}`,
    after: created.toObject(),
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.status(201).json({ license: created });
}

export async function patchLicense(req: Request, res: Response) {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const doc = await License.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  const before = doc.toObject();

  if (parsed.data.name !== undefined) doc.name = parsed.data.name.trim();
  if (parsed.data.vendor !== undefined) doc.vendor = parsed.data.vendor.trim();
  if (parsed.data.type !== undefined) doc.type = parsed.data.type;
  if (parsed.data.seatsTotal !== undefined)
    doc.seatsTotal = parsed.data.seatsTotal;
  if (parsed.data.expiresAt !== undefined)
    doc.expiresAt = parsed.data.expiresAt
      ? new Date(parsed.data.expiresAt)
      : undefined;
  if (parsed.data.renewalAt !== undefined)
    doc.renewalAt = parsed.data.renewalAt
      ? new Date(parsed.data.renewalAt)
      : undefined;
  if (parsed.data.notes !== undefined) doc.notes = parsed.data.notes;
  if (parsed.data.isActive !== undefined) doc.isActive = parsed.data.isActive;

  await doc.save();
  const after = doc.toObject();

  await writeAudit({
    action: "LICENSE_UPDATE",
    module: "licenses",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "License",
    entityId: String(doc._id),
    summary: `Updated license ${doc.key}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ license: after });
}
