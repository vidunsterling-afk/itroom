import type { Request, Response } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { User } from "../models/User";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../utils/tokens";
import { writeAudit } from "../utils/audit";

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  const auditCtx = (req as any).auditCtx ?? {};
  if (!parsed.success) {
    await writeAudit({
      action: "AUTH_LOGIN",
      module: "auth",
      status: "FAIL",
      summary: "Invalid payload",
      ip: auditCtx.ip,
      userAgent: auditCtx.userAgent,
    });
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { identifier, password } = parsed.data;

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
  });

  if (!user || !user.isActive) {
    await writeAudit({
      action: "AUTH_LOGIN",
      module: "auth",
      status: "FAIL",
      summary: "User not found or inactive",
      actorUsername: identifier,
      ip: auditCtx.ip,
      userAgent: auditCtx.userAgent,
    });
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) {
    await writeAudit({
      action: "AUTH_LOGIN",
      module: "auth",
      status: "FAIL",
      actorUserId: String(user._id),
      actorUsername: user.username,
      summary: "Wrong password",
      ip: auditCtx.ip,
      userAgent: auditCtx.userAgent,
    });
    return res.status(401).json({ message: "Invalid credentials" });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken({
    sub: String(user._id),
    username: user.username,
    role: user.role,
  });

  // tokenVersion ready for future “logout all devices”
  const refreshToken = signRefreshToken({
    sub: String(user._id),
    tokenVersion: 0,
  });

  res.cookie("itroom_refresh", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production https
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await writeAudit({
    action: "AUTH_LOGIN",
    module: "auth",
    status: "SUCCESS",
    actorUserId: String(user._id),
    actorUsername: user.username,
    summary: "Login success",
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  });

  return res.json({
    accessToken,
    user: {
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

export async function me(req: Request, res: Response) {
  const u = (req as any).user;
  return res.json({ user: u });
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("itroom_refresh", { path: "/api/auth/refresh" });
  return res.json({ message: "Logged out" });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.itroom_refresh;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = verifyRefresh(token);

    const user = await User.findById(payload.sub).lean();
    if (!user || !user.isActive)
      return res.status(401).json({ message: "Unauthorized" });

    const accessToken = signAccessToken({
      sub: String(user._id),
      username: user.username,
      role: user.role,
    });

    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}
