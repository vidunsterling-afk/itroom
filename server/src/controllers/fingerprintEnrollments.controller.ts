import type { Request, Response } from "express";
import { z } from "zod";
import { FingerprintEnrollment } from "../models/FingerprintEnrollment";
import { FingerprintMachine } from "../models/FingerprintMachine";
import { FingerprintEvent } from "../models/FingerprintEvent";
import { Employee } from "../models/Employee";
import { generateFingerprintDocNumber } from "../utils/docNumber";
import { writeAudit } from "../utils/audit";

const listSchema = z.object({
  q: z.string().optional(),
  status: z
    .enum(["assigned", "pending_hr_signature", "signed", "cancelled"])
    .optional(),
  machineId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const createSchema = z.object({
  machineId: z.string().min(1),
  assigneeType: z.enum(["employee", "external"]),

  employeeId: z.string().optional(),

  externalFullName: z.string().optional(),
  externalDepartment: z.string().optional(),
  externalIdNumber: z.string().optional(),

  attendanceEmployeeNo: z.string().min(1),

  status: z.enum(["assigned", "pending_hr_signature"]).optional(),
  assignedAt: z.string().datetime().optional(),

  itRemarks: z.string().optional(),
});

const patchSchema = z.object({
  // machine change allowed? usually no. keep simple: not allowed here.
  attendanceEmployeeNo: z.string().optional(),
  itRemarks: z.string().optional(),
  externalFullName: z.string().optional(),
  externalDepartment: z.string().optional(),
  externalIdNumber: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(["assigned", "pending_hr_signature", "signed", "cancelled"]),
  note: z.string().optional(),

  // only for signed
  hrSignerName: z.string().optional(),
  hrSignedAt: z.string().datetime().optional(),
  hrRemarks: z.string().optional(),
});

export async function listFingerprintEnrollments(req: Request, res: Response) {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid query" });

  const { q, status, machineId, page, limit } = parsed.data;
  const filter: any = {};
  if (status) filter.status = status;
  if (machineId) filter.machineId = machineId;

  if (q?.trim()) {
    const s = q.trim();
    filter.$or = [
      { docNumber: { $regex: s, $options: "i" } },
      { attendanceEmployeeNo: { $regex: s, $options: "i" } },
      { createdByUsername: { $regex: s, $options: "i" } },
      { externalFullName: { $regex: s, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    FingerprintEnrollment.find(filter)
      .sort({ assignedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FingerprintEnrollment.countDocuments(filter),
  ]);

  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
}

export async function getFingerprintEnrollment(req: Request, res: Response) {
  const doc = await FingerprintEnrollment.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: "Not found" });

  // enrich for UI: machine + employee
  const [machine, employee] = await Promise.all([
    FingerprintMachine.findById(doc.machineId).lean(),
    doc.employeeId
      ? Employee.findById(doc.employeeId).lean()
      : Promise.resolve(null),
  ]);

  res.json({ enrollment: doc, machine, employee });
}

export async function listFingerprintEvents(req: Request, res: Response) {
  const enrollmentId = req.params.id;
  const items = await FingerprintEvent.find({ enrollmentId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ items });
}

export async function createFingerprintEnrollment(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const machine = await FingerprintMachine.findById(
    parsed.data.machineId,
  ).lean();
  if (!machine || !machine.isActive)
    return res.status(400).json({ message: "Machine not found/inactive" });

  if (parsed.data.assigneeType === "employee") {
    if (!parsed.data.employeeId)
      return res.status(400).json({ message: "employeeId is required" });
    const emp = await Employee.findById(parsed.data.employeeId).lean();
    if (!emp || !emp.isActive)
      return res.status(400).json({ message: "Employee not found/inactive" });
  } else {
    if (!parsed.data.externalFullName?.trim())
      return res.status(400).json({ message: "externalFullName is required" });
  }

  const docNumber = await generateFingerprintDocNumber(new Date());

  const created = await FingerprintEnrollment.create({
    docNumber,
    machineId: parsed.data.machineId,
    assigneeType: parsed.data.assigneeType,

    employeeId:
      parsed.data.assigneeType === "employee"
        ? parsed.data.employeeId
        : undefined,
    externalFullName:
      parsed.data.assigneeType === "external"
        ? parsed.data.externalFullName?.trim()
        : undefined,
    externalDepartment:
      parsed.data.assigneeType === "external"
        ? parsed.data.externalDepartment?.trim()
        : undefined,
    externalIdNumber:
      parsed.data.assigneeType === "external"
        ? parsed.data.externalIdNumber?.trim()
        : undefined,

    attendanceEmployeeNo: parsed.data.attendanceEmployeeNo.trim(),

    status: parsed.data.status ?? "assigned",
    assignedAt: parsed.data.assignedAt
      ? new Date(parsed.data.assignedAt)
      : new Date(),

    itRemarks: parsed.data.itRemarks?.trim(),

    createdByUserId: actor?.sub,
    createdByUsername: actor?.username,
  });

  await FingerprintEvent.create({
    enrollmentId: created._id,
    type: "CREATE",
    note: `Created enrollment (${created.status})`,
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  });

  await writeAudit({
    action: "FP_ENROLL_CREATE",
    module: "fingerprints",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "FingerprintEnrollment",
    entityId: String(created._id),
    summary: `Created fingerprint enrollment ${created.docNumber}`,
    after: created.toObject(),
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.status(201).json({ enrollment: created });
}

export async function patchFingerprintEnrollment(req: Request, res: Response) {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const doc = await FingerprintEnrollment.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  const before = doc.toObject();

  if (parsed.data.attendanceEmployeeNo !== undefined)
    doc.attendanceEmployeeNo = parsed.data.attendanceEmployeeNo.trim();
  if (parsed.data.itRemarks !== undefined)
    doc.itRemarks = parsed.data.itRemarks?.trim();

  // allow external fields update only if external
  if (doc.assigneeType === "external") {
    if (parsed.data.externalFullName !== undefined)
      doc.externalFullName = parsed.data.externalFullName?.trim();
    if (parsed.data.externalDepartment !== undefined)
      doc.externalDepartment = parsed.data.externalDepartment?.trim();
    if (parsed.data.externalIdNumber !== undefined)
      doc.externalIdNumber = parsed.data.externalIdNumber?.trim();
  }

  await doc.save();
  const after = doc.toObject();

  await FingerprintEvent.create({
    enrollmentId: doc._id,
    type: "UPDATE",
    note: "Updated enrollment fields",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  });

  await writeAudit({
    action: "FP_ENROLL_UPDATE",
    module: "fingerprints",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "FingerprintEnrollment",
    entityId: String(doc._id),
    summary: `Updated fingerprint enrollment ${doc.docNumber}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ enrollment: after });
}

export async function changeFingerprintEnrollmentStatus(
  req: Request,
  res: Response,
) {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const doc = await FingerprintEnrollment.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  const before = doc.toObject();
  doc.status = parsed.data.status;

  if (parsed.data.status === "signed") {
    if (!parsed.data.hrSignerName?.trim())
      return res
        .status(400)
        .json({ message: "hrSignerName is required for signed" });
    doc.hrSignerName = parsed.data.hrSignerName.trim();
    doc.hrSignedAt = parsed.data.hrSignedAt
      ? new Date(parsed.data.hrSignedAt)
      : new Date();
    doc.hrRemarks = parsed.data.hrRemarks?.trim();
  }

  if (parsed.data.status === "cancelled") {
    // keep existing hr fields, but ok
  }

  await doc.save();
  const after = doc.toObject();

  await FingerprintEvent.create({
    enrollmentId: doc._id,
    type: "STATUS_CHANGE",
    note: parsed.data.note?.trim() || `Status -> ${parsed.data.status}`,
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  });

  await writeAudit({
    action: "FP_ENROLL_STATUS",
    module: "fingerprints",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "FingerprintEnrollment",
    entityId: String(doc._id),
    summary: `Changed status ${doc.docNumber} -> ${parsed.data.status}`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ enrollment: after });
}
