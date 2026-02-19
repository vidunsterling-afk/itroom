import type { Request, Response } from "express";
import { z } from "zod";
import { AuditLog } from "../models/AuditLog";

const querySchema = z.object({
  module: z.string().min(1).optional(),
  action: z.string().min(1).optional(),
  actor: z.string().min(1).optional(),
  entityId: z.string().min(1).optional(),
  status: z.enum(["SUCCESS", "FAIL"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export async function listAudit(req: Request, res: Response) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid query params" });

  const { module, action, actor, entityId, status, from, to, page, limit } =
    parsed.data;

  const filter: any = {};
  if (module) filter.module = module;
  if (action) filter.action = action;
  if (actor) filter.actorUsername = actor;
  if (entityId) filter.entityId = entityId;
  if (status) filter.status = status;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select({
        actorUsername: 1,
        action: 1,
        module: 1,
        entityType: 1,
        entityId: 1,
        summary: 1,
        status: 1,
        ip: 1,
        userAgent: 1,
        createdAt: 1,
      })
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items,
  });
}
