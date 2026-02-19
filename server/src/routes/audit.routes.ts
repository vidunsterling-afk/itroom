import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import { requirePerm } from "../middleware/requirePerm";
import { listAudit } from "../controllers/audit.controller";

export const auditRoutes = Router();
auditRoutes.get("/", authRequired, requirePerm("audit", "read"), listAudit);
