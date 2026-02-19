import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import { requireRole } from "../middleware/requireRole";
import {
  listModules,
  createModule,
  patchModule,
} from "../controllers/modules.controller";

export const modulesRoutes = Router();

modulesRoutes.get(
  "/",
  authRequired,
  requireRole("admin", "auditor", "staff"),
  listModules,
);
modulesRoutes.post("/", authRequired, requireRole("admin"), createModule);
modulesRoutes.patch("/:id", authRequired, requireRole("admin"), patchModule);
