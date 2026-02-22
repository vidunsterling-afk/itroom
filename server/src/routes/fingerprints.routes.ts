import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import { requirePerm } from "../middleware/requirePerm";

import {
  listFingerprintMachines,
  createFingerprintMachine,
  patchFingerprintMachine,
} from "../controllers/fingerprintMachines.controller";

import {
  listFingerprintEnrollments,
  getFingerprintEnrollment,
  listFingerprintEvents,
  createFingerprintEnrollment,
  patchFingerprintEnrollment,
  changeFingerprintEnrollmentStatus,
} from "../controllers/fingerprintEnrollments.controller";

import { printFingerprintEnrollment } from "../controllers/fingerprintPrint.controller";

export const fingerprintsRoutes = Router();

/** Machines */
fingerprintsRoutes.get(
  "/machines",
  authRequired,
  requirePerm("fingerprints", "read"),
  listFingerprintMachines,
);
fingerprintsRoutes.post(
  "/machines",
  authRequired,
  requirePerm("fingerprints", "create"),
  createFingerprintMachine,
);
fingerprintsRoutes.patch(
  "/machines/:id",
  authRequired,
  requirePerm("fingerprints", "update"),
  patchFingerprintMachine,
);

/** Enrollments */
fingerprintsRoutes.get(
  "/enrollments",
  authRequired,
  requirePerm("fingerprints", "read"),
  listFingerprintEnrollments,
);
fingerprintsRoutes.get(
  "/enrollments/:id",
  authRequired,
  requirePerm("fingerprints", "read"),
  getFingerprintEnrollment,
);
fingerprintsRoutes.get(
  "/enrollments/:id/events",
  authRequired,
  requirePerm("fingerprints", "read"),
  listFingerprintEvents,
);

fingerprintsRoutes.post(
  "/enrollments",
  authRequired,
  requirePerm("fingerprints", "assign"),
  createFingerprintEnrollment,
);
fingerprintsRoutes.patch(
  "/enrollments/:id",
  authRequired,
  requirePerm("fingerprints", "update"),
  patchFingerprintEnrollment,
);
fingerprintsRoutes.post(
  "/enrollments/:id/status",
  authRequired,
  requirePerm("fingerprints", "update"),
  changeFingerprintEnrollmentStatus,
);

/** Print PDF */
fingerprintsRoutes.get(
  "/enrollments/:id/print",
  authRequired,
  requirePerm("fingerprints", "print"),
  printFingerprintEnrollment,
);
