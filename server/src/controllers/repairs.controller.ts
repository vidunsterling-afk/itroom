import type { Request, Response } from "express";
import { z } from "zod";
import { Repair } from "../models/Repair";
import { Asset } from "../models/Asset";
import { writeAudit } from "../utils/audit";

const listSchema = z.object({
  q: z.string().optional(),
  assetId: z.string().optional(),
  status: z
    .enum(["reported", "sent", "repairing", "returned", "closed", "cancelled"])
    .optional(),
  vendor: z.string().optional(),
  warrantyOnly: z.coerce.boolean().optional(),
  expiringInDays: z.coerce.number().int().min(1).max(365).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const createSchema = z.object({
  assetId: z.string().min(1),
  vendorName: z.string().min(2),
  cost: z.number().min(0).optional(),
  status: z
    .enum(["reported", "sent", "repairing", "returned", "closed", "cancelled"])
    .optional(),

  reportedAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  returnedAt: z.string().datetime().optional(),
  closedAt: z.string().datetime().optional(),

  issue: z.string().min(3),
  resolution: z.string().optional(),

  isWarrantyClaim: z.boolean().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  warrantyProvider: z.string().optional(),

  notes: z.string().optional(),
});

const patchSchema = createSchema.partial().omit({ assetId: true });

export async function listRepairs(req: Request, res: Response) {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid query" });

  const {
    q,
    assetId,
    status,
    vendor,
    warrantyOnly,
    expiringInDays,
    page,
    limit,
  } = parsed.data;

  const filter: any = {};
  if (assetId) filter.assetId = assetId;
  if (status) filter.status = status;
  if (vendor) filter.vendorName = vendor;
  if (typeof warrantyOnly === "boolean" && warrantyOnly)
    filter.isWarrantyClaim = true;

  if (q?.trim()) {
    const s = q.trim();
    filter.$or = [
      { vendorName: { $regex: s, $options: "i" } },
      { issue: { $regex: s, $options: "i" } },
      { resolution: { $regex: s, $options: "i" } },
      { notes: { $regex: s, $options: "i" } },
    ];
  }

  if (expiringInDays) {
    const now = new Date();
    const to = new Date(Date.now() + expiringInDays * 24 * 60 * 60 * 1000);
    filter.warrantyExpiry = { $gte: now, $lte: to };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Repair.find(filter).sort({ reportedAt: -1 }).skip(skip).limit(limit).lean(),
    Repair.countDocuments(filter),
  ]);

  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
}

export async function listRepairsByAsset(req: Request, res: Response) {
  const assetId = req.params.assetId;
  const items = await Repair.find({ assetId })
    .sort({ reportedAt: -1 })
    .limit(100)
    .lean();
  res.json({ items });
}

export async function getRepair(req: Request, res: Response) {
  const doc = await Repair.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json({ repair: doc });
}

export async function createRepair(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const asset = await Asset.findById(parsed.data.assetId).lean();
  if (!asset) return res.status(400).json({ message: "Asset not found" });

  const created = await Repair.create({
    assetId: parsed.data.assetId,
    vendorName: parsed.data.vendorName.trim(),
    cost: parsed.data.cost ?? 0,
    status: parsed.data.status ?? "reported",

    reportedAt: parsed.data.reportedAt
      ? new Date(parsed.data.reportedAt)
      : new Date(),
    sentAt: parsed.data.sentAt ? new Date(parsed.data.sentAt) : undefined,
    returnedAt: parsed.data.returnedAt
      ? new Date(parsed.data.returnedAt)
      : undefined,
    closedAt: parsed.data.closedAt ? new Date(parsed.data.closedAt) : undefined,

    issue: parsed.data.issue.trim(),
    resolution: parsed.data.resolution?.trim(),

    isWarrantyClaim: parsed.data.isWarrantyClaim ?? false,
    warrantyExpiry: parsed.data.warrantyExpiry
      ? new Date(parsed.data.warrantyExpiry)
      : undefined,
    warrantyProvider: parsed.data.warrantyProvider?.trim(),

    notes: parsed.data.notes?.trim(),
  });

  await writeAudit({
    action: "REPAIR_CREATE",
    module: "repairs",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Repair",
    entityId: String(created._id),
    summary: `Created repair for asset ${asset.assetTag} (${created.status})`,
    after: created.toObject(),
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.status(201).json({ repair: created });
}

export async function patchRepair(req: Request, res: Response) {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const doc = await Repair.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  const before = doc.toObject();

  if (parsed.data.vendorName !== undefined)
    doc.vendorName = parsed.data.vendorName.trim();
  if (parsed.data.cost !== undefined) doc.cost = parsed.data.cost ?? 0;
  if (parsed.data.status !== undefined) doc.status = parsed.data.status;

  if (parsed.data.reportedAt !== undefined)
    doc.reportedAt = parsed.data.reportedAt
      ? new Date(parsed.data.reportedAt)
      : doc.reportedAt;
  if (parsed.data.sentAt !== undefined)
    doc.sentAt = parsed.data.sentAt ? new Date(parsed.data.sentAt) : undefined;
  if (parsed.data.returnedAt !== undefined)
    doc.returnedAt = parsed.data.returnedAt
      ? new Date(parsed.data.returnedAt)
      : undefined;
  if (parsed.data.closedAt !== undefined)
    doc.closedAt = parsed.data.closedAt
      ? new Date(parsed.data.closedAt)
      : undefined;

  if (parsed.data.issue !== undefined) doc.issue = parsed.data.issue.trim();
  if (parsed.data.resolution !== undefined)
    doc.resolution = parsed.data.resolution?.trim();

  if (parsed.data.isWarrantyClaim !== undefined)
    doc.isWarrantyClaim = parsed.data.isWarrantyClaim;
  if (parsed.data.warrantyExpiry !== undefined)
    doc.warrantyExpiry = parsed.data.warrantyExpiry
      ? new Date(parsed.data.warrantyExpiry)
      : undefined;
  if (parsed.data.warrantyProvider !== undefined)
    doc.warrantyProvider = parsed.data.warrantyProvider?.trim();

  if (parsed.data.notes !== undefined) doc.notes = parsed.data.notes?.trim();

  await doc.save();
  const after = doc.toObject();

  await writeAudit({
    action: "REPAIR_UPDATE",
    module: "repairs",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Repair",
    entityId: String(doc._id),
    summary: `Updated repair ${doc._id}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ repair: after });
}
