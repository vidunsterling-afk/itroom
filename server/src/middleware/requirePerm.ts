import type { Request, Response, NextFunction } from "express";
import { getStaffActions } from "../utils/permCache";

export function requirePerm(moduleKey: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const u = (req as any).user as { role?: string } | undefined;
    if (!u?.role) return res.status(401).json({ message: "Unauthorized" });

    if (u.role === "admin") return next();
    if (u.role === "auditor") {
      if (action === "read") return next();
      return res.status(403).json({ message: "Auditor is read-only" });
    }

    // staff
    const allowed = await getStaffActions(moduleKey);
    if (allowed.has(action)) return next();

    return res.status(403).json({ message: "Forbidden" });
  };
}
