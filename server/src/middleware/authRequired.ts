import type { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../utils/tokens";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = verifyAccess(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
