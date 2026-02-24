import { Router, Request, Response } from "express";
import { sendEmail, SendEmailInput } from "../services/emailService";

const router = Router();

function requireApiKey(req: Request, res: Response): boolean {
  const required = process.env.EMAIL_API_KEY;
  if (!required) return true; // if not set, skip protection (dev mode)

  const provided = req.header("x-api-key");
  if (provided !== required) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
}

router.post("/send", async (req: Request, res: Response) => {
  if (!requireApiKey(req, res)) return;

  const { to, cc, subject, html, saveToSentItems } = req.body ?? {};

  const payload: SendEmailInput = { to, cc, subject, html, saveToSentItems };

  try {
    await sendEmail(payload);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

export default router;
