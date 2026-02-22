import type { Request, Response } from "express";
import { z } from "zod";
import { License } from "../models/License";
import { LicenseAssignment } from "../models/LicenseAssignment";
import { Employee } from "../models/Employee";
import { writeAudit } from "../utils/audit";

const assignSchema = z.object({
  employeeId: z.string().min(1),
  seatCount: z.number().int().min(1).default(1),
  note: z.string().optional(),
});

export async function listLicenseAssignments(req: Request, res: Response) {
  const licenseId = req.params.id;

  const items = await LicenseAssignment.find({ licenseId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({ items });
}

export async function assignLicense(req: Request, res: Response) {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const [lic, emp] = await Promise.all([
    License.findById(req.params.id),
    Employee.findById(parsed.data.employeeId).lean(),
  ]);

  if (!lic) return res.status(404).json({ message: "License not found" });
  if (!emp || !emp.isActive)
    return res.status(400).json({ message: "Employee not found/inactive" });

  const seatCount = parsed.data.seatCount;

  if (lic.seatsUsed + seatCount > lic.seatsTotal) {
    return res.status(409).json({ message: "Not enough seats available" });
  }

  // create assignment (unique active enforced by index)
  await LicenseAssignment.create({
    licenseId: lic._id,
    employeeId: emp._id,
    seatCount,
    note: parsed.data.note,
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  });

  // update seatsUsed fast
  lic.seatsUsed += seatCount;
  await lic.save();

  await writeAudit({
    action: "LICENSE_ASSIGN",
    module: "licenses",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "License",
    entityId: String(lic._id),
    summary: `Assigned ${lic.key} to ${emp.fullName} (${emp.employeeId})`,
    after: {
      licenseKey: lic.key,
      employee: {
        id: String(emp._id),
        name: emp.fullName,
        employeeId: emp.employeeId,
      },
      seatCount,
    },
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ license: lic.toObject() });
}

const unassignSchema = z.object({
  employeeId: z.string().min(1),
  note: z.string().optional(),
});

export async function unassignLicense(req: Request, res: Response) {
  const parsed = unassignSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const lic = await License.findById(req.params.id);
  if (!lic) return res.status(404).json({ message: "License not found" });

  const active = await LicenseAssignment.findOne({
    licenseId: lic._id,
    employeeId: parsed.data.employeeId,
    unassignedAt: null,
  });

  if (!active)
    return res.status(404).json({ message: "Active assignment not found" });

  active.unassignedAt = new Date();
  if (parsed.data.note) active.note = parsed.data.note;
  await active.save();

  // update seatsUsed
  lic.seatsUsed = Math.max(0, lic.seatsUsed - (active.seatCount || 1));
  await lic.save();

  await writeAudit({
    action: "LICENSE_UNASSIGN",
    module: "licenses",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "License",
    entityId: String(lic._id),
    summary: `Unassigned ${lic.key} from employee ${parsed.data.employeeId}`,
    after: {
      licenseKey: lic.key,
      employeeId: parsed.data.employeeId,
      seatCount: active.seatCount,
    },
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ license: lic.toObject() });
}
