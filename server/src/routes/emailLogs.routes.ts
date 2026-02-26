import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import {
  getEmailLogCounts,
  listEmailLogs,
} from "../controllers/emailLogs.controller";

export const emailLogRoutes = Router();

emailLogRoutes.get("/", authRequired, listEmailLogs);
emailLogRoutes.get("/counts", authRequired, getEmailLogCounts);
