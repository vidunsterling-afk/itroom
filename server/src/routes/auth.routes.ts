import { Router } from "express";
import { login, logout, me, refresh } from "../controllers/auth.controller";
import { authRequired } from "../middleware/authRequired";

export const authRoutes = Router();
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authRequired, me);
authRoutes.post("/refresh", refresh);
