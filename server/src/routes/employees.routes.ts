import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import { requirePerm } from "../middleware/requirePerm";
import {
  listEmployees,
  getEmployee,
  createEmployee,
  patchEmployee,
} from "../controllers/employees.controller";

export const employeesRoutes = Router();

employeesRoutes.get(
  "/",
  authRequired,
  requirePerm("employees", "read"),
  listEmployees,
);
employeesRoutes.get(
  "/:id",
  authRequired,
  requirePerm("employees", "read"),
  getEmployee,
);

employeesRoutes.post(
  "/",
  authRequired,
  requirePerm("employees", "create"),
  createEmployee,
);
employeesRoutes.patch(
  "/:id",
  authRequired,
  requirePerm("employees", "update"),
  patchEmployee,
);
