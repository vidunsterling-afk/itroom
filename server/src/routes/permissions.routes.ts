import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import { requireRole } from "../middleware/requireRole";
import {
  listStaffPermissions,
  upsertStaffPermission,
} from "../controllers/permissions.controller";

export const permissionsRoutes = Router();

permissionsRoutes.get(
  "/staff",
  authRequired,
  requireRole("admin"),
  listStaffPermissions,
);
permissionsRoutes.put(
  "/staff",
  authRequired,
  requireRole("admin"),
  upsertStaffPermission,
);
