import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../models/User";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = (req as any).user as { role?: UserRole } | undefined;
    if (!u?.role) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(u.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
