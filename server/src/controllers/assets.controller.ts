import type { Request, Response } from "express";
import { z } from "zod";
import { Asset } from "../models/Asset";
import { writeAudit } from "../utils/audit";
import { writeAssetEvent } from "../utils/assetEvents";

const createSchema = z.object({
  assetTag: z.string().min(2),
  name: z.string().min(2),
  brand: z.string().min(1),
  model: z.string().min(1),
  category: z.enum([
    "laptop",
    "pc",
    "router",
    "switch",
    "server",
    "monitor",
    "printer",
    "other",
  ]),
  serialNumber: z.string().optional(),
  status: z.enum(["active", "in-repair", "retired"]).default("active"),
  specs: z.any().optional(),
  notes: z.string().optional(),
});

const listSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  category: z
    .enum([
      "laptop",
      "pc",
      "router",
      "switch",
      "server",
      "monitor",
      "printer",
      "other",
    ])
    .optional(),
  serialNumber: z.string().optional(),
  specs: z.any().optional(),
  notes: z.string().optional(),
});

export async function listAssets(req: Request, res: Response) {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid query" });

  const { q, category, status, page, limit } = parsed.data;
  const filter: Record<string, unknown> = {};

  if (category) filter.category = category;
  if (status) filter.status = status;

  if (q?.trim()) {
    const s = q.trim();
    filter.$or = [
      { assetTag: { $regex: s, $options: "i" } },
      { name: { $regex: s, $options: "i" } },
      { serialNumber: { $regex: s, $options: "i" } },
      { "currentAssignment.assigneeName": { $regex: s, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Asset.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select({
        assetTag: 1,
        name: 1,
        category: 1,
        serialNumber: 1,
        status: 1,
        currentAssignment: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean(),
    Asset.countDocuments(filter),
  ]);

  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
}

export async function getAsset(req: Request, res: Response) {
  const asset = await Asset.findById(req.params.id).lean();
  if (!asset) return res.status(404).json({ message: "Not found" });
  res.json({ asset });
}

export async function createAsset(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const exists = await Asset.findOne({ assetTag: parsed.data.assetTag }).lean();
  if (exists)
    return res.status(409).json({ message: "assetTag already exists" });

  const created = await Asset.create({
    ...parsed.data,
    currentAssignment: null,
  });

  await writeAudit({
    action: "ASSET_CREATE",
    module: "assets",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Asset",
    entityId: String(created._id),
    summary: `Created asset ${created.assetTag}`,
    after: created.toObject(),
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  await writeAssetEvent({
    assetId: String(created._id),
    type: "UPDATE_DETAILS",
    after: created.toObject(),
    note: "Asset created",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  });

  res.status(201).json({ asset: created });
}

export async function patchAsset(req: Request, res: Response) {
  const parsed = patchSchema.safeParse(req.body);
  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const doc = await Asset.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  const before = doc.toObject();
  doc.set(parsed.data as any);
  await doc.save();
  const after = doc.toObject();

  await writeAudit({
    action: "ASSET_UPDATE",
    module: "assets",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Asset",
    entityId: String(doc._id),
    summary: `Updated asset ${doc.assetTag}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  await writeAssetEvent({
    assetId: String(doc._id),
    type: "UPDATE_DETAILS",
    before,
    after,
    note: "Asset details updated",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  });

  res.json({ asset: after });
}
