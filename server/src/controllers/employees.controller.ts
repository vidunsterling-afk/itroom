import type { Request, Response } from "express";
import { z } from "zod";
import { nextEmployeeId } from "../utils/idGenerator";
import { Employee } from "../models/Employee";
import { writeAudit } from "../utils/audit";

const listSchema = z.object({
  q: z.string().optional(),
  department: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const createSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

const patchSchema = createSchema.partial();

export async function listEmployees(req: Request, res: Response) {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid query" });

  const { q, department, isActive, page, limit } = parsed.data;
  const filter: any = {};

  if (department) filter.department = department;
  if (typeof isActive === "boolean") filter.isActive = isActive;

  if (q?.trim()) {
    filter.$text = { $search: q.trim() };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Employee.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select({
        employeeId: 1,
        fullName: 1,
        email: 1,
        department: 1,
        title: 1,
        phone: 1,
        isActive: 1,
        createdAt: 1,
      })
      .lean(),
    Employee.countDocuments(filter),
  ]);

  res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
}

export async function getEmployee(req: Request, res: Response) {
  const emp = await Employee.findById(req.params.id).lean();
  if (!emp) return res.status(404).json({ message: "Not found" });
  res.json({ employee: emp });
}

export async function createEmployee(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const employeeId = await nextEmployeeId();

  const created = await Employee.create({
    employeeId,
    ...parsed.data,
  });

  await writeAudit({
    action: "EMPLOYEE_CREATE",
    module: "employees",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Employee",
    entityId: String(created._id),
    summary: `Created employee ${created.fullName} (${created.employeeId})`,
    after: created.toObject(),
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.status(201).json({ employee: created });
}

export async function patchEmployee(req: Request, res: Response) {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid payload" });

  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const doc = await Employee.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });

  const before = doc.toObject();
  doc.set(parsed.data as any);
  await doc.save();
  const after = doc.toObject();

  await writeAudit({
    action: "EMPLOYEE_UPDATE",
    module: "employees",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "Employee",
    entityId: String(doc._id),
    summary: `Updated employee ${doc.fullName} (${doc.employeeId})`,
    before,
    after,
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  res.json({ employee: after });
}
