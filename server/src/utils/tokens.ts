import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import type { UserRole } from "../models/User";

export type AccessPayload = { sub: string; username: string; role: UserRole };
export type RefreshPayload = { sub: string; tokenVersion: number };

export function signAccessToken(p: AccessPayload) {
  return jwt.sign(p, ENV.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(p: RefreshPayload) {
  return jwt.sign(p, ENV.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as RefreshPayload;
}
