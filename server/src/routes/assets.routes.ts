import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import { requirePerm } from "../middleware/requirePerm";

import {
  listAssets,
  getAsset,
  createAsset,
  patchAsset,
} from "../controllers/assets.controller";
import {
  assignAsset,
  unassignAsset,
  changeAssetStatus,
} from "../controllers/assets.actions.controller";
import { listAssetEvents } from "../controllers/assets.events.controller";

export const assetsRoutes = Router();

// read
assetsRoutes.get("/", authRequired, requirePerm("assets", "read"), listAssets);
assetsRoutes.get("/:id", authRequired, requirePerm("assets", "read"), getAsset);
assetsRoutes.get(
  "/:id/events",
  authRequired,
  requirePerm("assets", "read"),
  listAssetEvents,
);

// write
assetsRoutes.post(
  "/",
  authRequired,
  requirePerm("assets", "create"),
  createAsset,
);
assetsRoutes.patch(
  "/:id",
  authRequired,
  requirePerm("assets", "update"),
  patchAsset,
);

// actions
assetsRoutes.post(
  "/:id/assign",
  authRequired,
  requirePerm("assets", "assign"),
  assignAsset,
);
assetsRoutes.post(
  "/:id/unassign",
  authRequired,
  requirePerm("assets", "assign"),
  unassignAsset,
);
assetsRoutes.post(
  "/:id/status",
  authRequired,
  requirePerm("assets", "status"),
  changeAssetStatus,
);
