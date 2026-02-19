import type { Request, Response } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { User } from "../models/User";
import { writeAudit } from "../utils/audit";

const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "auditor", "staff"]),
});

export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body);
  const auditCtx = (req as any).auditCtx ?? {};
  const actor = (req as any).user;

  if (!parsed.success) {
    await writeAudit({
      action: "USER_CREATE",
      module: "users",
      status: "FAIL",
      actorUserId: actor?.sub,
      actorUsername: actor?.username,
      summary: "Invalid payload",
      ip: auditCtx.ip,
      userAgent: auditCtx.userAgent,
    });
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { username, email, password, role } = parsed.data;

  const exists = await User.findOne({
    $or: [{ username }, { email: email.toLowerCase() }],
  }).lean();
  if (exists)
    return res
      .status(409)
      .json({ message: "Username or email already exists" });

  const passwordHash = await argon2.hash(password);

  const created = await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash,
    role,
    isActive: true,
  });

  await writeAudit({
    action: "USER_CREATE",
    module: "users",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "User",
    entityId: String(created._id),
    summary: `Created user ${created.username} (${created.role})`,
    after: {
      username: created.username,
      email: created.email,
      role: created.role,
      isActive: created.isActive,
    },
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  return res.status(201).json({
    user: {
      id: String(created._id),
      username: created.username,
      email: created.email,
      role: created.role,
    },
  });
}
