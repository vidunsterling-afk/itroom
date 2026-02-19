import type { Request, Response, NextFunction } from "express";

export function auditContext(req: Request, _res: Response, next: NextFunction) {
  // best-effort IP
  const xfwd = req.headers["x-forwarded-for"];
  const ip =
    (typeof xfwd === "string" ? xfwd.split(",")[0]?.trim() : undefined) ||
    req.socket.remoteAddress ||
    "";

  (req as any).auditCtx = {
    ip,
    userAgent: req.headers["user-agent"] ?? "",
  };

  next();
}
