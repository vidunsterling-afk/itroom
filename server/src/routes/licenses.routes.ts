import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import { requirePerm } from "../middleware/requirePerm";

import {
  listLicenses,
  getLicense,
  createLicense,
  patchLicense,
} from "../controllers/licenses.controller";
import {
  listLicenseAssignments,
  assignLicense,
  unassignLicense,
} from "../controllers/licenses.assignments.controller";

export const licensesRoutes = Router();

// read
licensesRoutes.get(
  "/",
  authRequired,
  requirePerm("licenses", "read"),
  listLicenses,
);
licensesRoutes.get(
  "/:id",
  authRequired,
  requirePerm("licenses", "read"),
  getLicense,
);
licensesRoutes.get(
  "/:id/assignments",
  authRequired,
  requirePerm("licenses", "read"),
  listLicenseAssignments,
);

// write
licensesRoutes.post(
  "/",
  authRequired,
  requirePerm("licenses", "create"),
  createLicense,
);
licensesRoutes.patch(
  "/:id",
  authRequired,
  requirePerm("licenses", "update"),
  patchLicense,
);

// actions
licensesRoutes.post(
  "/:id/assign",
  authRequired,
  requirePerm("licenses", "assign"),
  assignLicense,
);
licensesRoutes.post(
  "/:id/unassign",
  authRequired,
  requirePerm("licenses", "assign"),
  unassignLicense,
);
