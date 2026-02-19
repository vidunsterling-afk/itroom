import type { Request, Response } from "express";
import { z } from "zod";
import { Employee } from "../models/Employee";
import { Asset } from "../models/Asset";
import { writeAudit } from "../utils/audit";
import { writeAssetEvent } from "../utils/assetEvents";

const assignSchema = z.object({
  assigneeType: z.enum(["employee", "external"]),
  employeeId: z.string().optional(),
  assigneeName: z.string().min(2).optional(),
  note: z.string().optional(),
});

export async function assignAsset(req: Request, res: Response) {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ message: "Not found" });

  const before = asset.toObject();

  let assigneeName = "";
  let employeeObjId: any = undefined;

  if (parsed.data.assigneeType === "employee") {
    if (!parsed.data.employeeId)
      return res.status(400).json({ message: "employeeId required" });
    const emp = await Employee.findById(parsed.data.employeeId).lean();
    if (!emp || !emp.isActive)
      return res.status(400).json({ message: "Employee not found/inactive" });
    assigneeName = `${emp.fullName} (${emp.employeeId})`;
    employeeObjId = emp._id;
  } else {
    if (!parsed.data.assigneeName)
      return res.status(400).json({ message: "assigneeName required" });
    assigneeName = parsed.data.assigneeName;
  }

  asset.currentAssignment = {
    assigneeType: parsed.data.assigneeType,
    employeeId: employeeObjId,
    assigneeName,
    assignedAt: new Date(),
  } as any;

  await asset.save();
  const after = asset.toObject();

  await writeAudit({
    action: "ASSET_ASSIGN",
    module: "assets",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Asset",
    entityId: String(asset._id),
    summary: `Assigned ${asset.assetTag} to ${assigneeName}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  await writeAssetEvent({
    assetId: String(asset._id),
    type: "ASSIGN",
    before,
    after,
    note: parsed.data.note,
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  });

  res.json({ asset: after });
}

export async function unassignAsset(req: Request, res: Response) {
  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ message: "Not found" });

  const before = asset.toObject();
  asset.currentAssignment = null as any;
  await asset.save();
  const after = asset.toObject();

  await writeAudit({
    action: "ASSET_UNASSIGN",
    module: "assets",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Asset",
    entityId: String(asset._id),
    summary: `Unassigned ${asset.assetTag}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  await writeAssetEvent({
    assetId: String(asset._id),
    type: "UNASSIGN",
    before,
    after,
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  });

  res.json({ asset: after });
}

const statusSchema = z.object({
  status: z.enum(["active", "in-repair", "retired"]),
  note: z.string().optional(),
});

export async function changeAssetStatus(req: Request, res: Response) {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const asset = await Asset.findById(req.params.id);
  if (!asset) return res.status(404).json({ message: "Not found" });

  const before = asset.toObject();
  asset.status = parsed.data.status;
  await asset.save();
  const after = asset.toObject();

  await writeAudit({
    action: "ASSET_STATUS_CHANGE",
    module: "assets",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Asset",
    entityId: String(asset._id),
    summary: `Changed ${asset.assetTag} status to ${parsed.data.status}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  await writeAssetEvent({
    assetId: String(asset._id),
    type: "STATUS_CHANGE",
    before,
    after,
    note: parsed.data.note,
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  });

  res.json({ asset: after });
}
