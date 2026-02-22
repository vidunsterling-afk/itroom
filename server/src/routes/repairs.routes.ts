import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import { requirePerm } from "../middleware/requirePerm";
import {
  listRepairs,
  listRepairsByAsset,
  getRepair,
  createRepair,
  patchRepair,
} from "../controllers/repairs.controller";

export const repairsRoutes = Router();

repairsRoutes.get(
  "/",
  authRequired,
  requirePerm("repairs", "read"),
  listRepairs,
);
repairsRoutes.get(
  "/asset/:assetId",
  authRequired,
  requirePerm("repairs", "read"),
  listRepairsByAsset,
);
repairsRoutes.get(
  "/:id",
  authRequired,
  requirePerm("repairs", "read"),
  getRepair,
);

repairsRoutes.post(
  "/",
  authRequired,
  requirePerm("repairs", "create"),
  createRepair,
);
repairsRoutes.patch(
  "/:id",
  authRequired,
  requirePerm("repairs", "update"),
  patchRepair,
);
