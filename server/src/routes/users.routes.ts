import { Router } from "express";
import { createUser } from "../controllers/users.controller";
import { authRequired } from "../middleware/authRequired";
import { requireRole } from "../middleware/requireRole";

export const usersRoutes = Router();
usersRoutes.post("/", authRequired, requireRole("admin"), createUser);
