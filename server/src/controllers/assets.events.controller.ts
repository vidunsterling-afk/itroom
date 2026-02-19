import type { Request, Response } from "express";
import { z } from "zod";
import { AssetEvent } from "../models/AssetEvent";

const qSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export async function listAssetEvents(req: Request, res: Response) {
  const parsed = qSchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid query" });

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const assetId = req.params.id;

  const [items, total] = await Promise.all([
    AssetEvent.find({ assetId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AssetEvent.countDocuments({ assetId }),
  ]);

  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
}
