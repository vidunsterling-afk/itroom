// services/sendEmail.ts (or wherever this file is)
import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import {
  logEmailSent,
  logEmailFailed,
  logEmailSkipped,
} from "../utils/emailLogger";

export type EmailRecipients = string | string[];

export interface SendEmailInput {
  to: EmailRecipients;
  cc?: EmailRecipients;
  subject: string;
  html: string;
  saveToSentItems?: boolean; // optional
}

type GraphRecipient = { emailAddress: { address: string } };

// ✅ ADD: env-controlled stop switch
function isEmailSendingDisabled(): boolean {
  const v = String(process.env.EMAIL_SENDING_DISABLED ?? "")
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!,
);

const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const token = await credential.getToken(
        "https://graph.microsoft.com/.default",
      );
      if (!token?.token) throw new Error("Failed to obtain Graph access token");
      return token.token;
    },
  },
});

function normalizeRecipients(value?: EmailRecipients): GraphRecipient[] {
  if (!value) return [];
  const arr = Array.isArray(value)
    ? value
    : String(value)
        .split(",")
        .map((s) => s.trim());

  return arr.filter(Boolean).map((address) => ({ emailAddress: { address } }));
}

function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const { to, cc, subject, html, saveToSentItems = true } = input;

  if (!to) throw new Error("Missing required field: to");
  if (!subject?.trim()) throw new Error("Missing required field: subject");
  if (!html?.trim()) throw new Error("Missing required field: html");

  // ✅ TEMP STOP: don't send, don't fail, don't throw
  if (isEmailSendingDisabled()) {
    await logEmailSkipped({ to, cc, subject });
    return;
  }

  const sender = assertEnv("SENDER_EMAIL");

  const message = {
    subject,
    body: { contentType: "HTML" as const, content: html },
    toRecipients: normalizeRecipients(to),
  } as {
    subject: string;
    body: { contentType: "HTML"; content: string };
    toRecipients: GraphRecipient[];
    ccRecipients?: GraphRecipient[];
  };

  const ccRecipients = normalizeRecipients(cc);
  if (ccRecipients.length) message.ccRecipients = ccRecipients;

  const payload = { message, saveToSentItems };

  try {
    await graphClient.api(`/users/${sender}/sendMail`).post(payload);

    // ✅ log success (don’t store html body)
    await logEmailSent({ to, cc, subject });
  } catch (err: any) {
    const detail =
      err?.body?.error?.message ||
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown error";

    // ✅ log failure
    await logEmailFailed({ to, cc, subject, error: detail });

    throw new Error(`Graph sendMail failed: ${detail}`);
  }
}
