// controllers/emailLogs.controller.ts
import type { Request, Response } from "express";
import { EmailLogModel } from "../models/EmailLog";

export async function getEmailLogCounts(req: Request, res: Response) {
  const [total, sent, failed] = await Promise.all([
    EmailLogModel.countDocuments(),
    EmailLogModel.countDocuments({ status: "SENT" }),
    EmailLogModel.countDocuments({ status: "FAILED" }),
  ]);

  res.json({ total, sent, failed });
}

export async function listEmailLogs(req: Request, res: Response) {
  const items = await EmailLogModel.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .select({ to: 1, cc: 1, subject: 1, status: 1, error: 1, createdAt: 1 })
    .lean();

  res.json({ items });
}
