import { Router } from "express";
import { listAudit } from "../controllers/audit.controller";
import { authRequired } from "../middleware/authRequired";
import { requireRole } from "../middleware/requireRole";

export const auditRoutes = Router();

auditRoutes.get("/", authRequired, requireRole("admin", "auditor"), listAudit);
