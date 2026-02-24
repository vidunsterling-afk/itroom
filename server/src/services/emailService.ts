import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";

export type EmailRecipients = string | string[];

export interface SendEmailInput {
  to: EmailRecipients;
  cc?: EmailRecipients;
  subject: string;
  html: string;
  saveToSentItems?: boolean; // optional
}

type GraphRecipient = { emailAddress: { address: string } };

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

  const sender = assertEnv("SENDER_EMAIL");

  const message = {
    subject,
    body: {
      contentType: "HTML" as const,
      content: html,
    },
    toRecipients: normalizeRecipients(to),
  } as {
    subject: string;
    body: { contentType: "HTML"; content: string };
    toRecipients: GraphRecipient[];
    ccRecipients?: GraphRecipient[];
  };

  const ccRecipients = normalizeRecipients(cc);
  if (ccRecipients.length) message.ccRecipients = ccRecipients;

  // Graph sendMail payload
  const payload = {
    message,
    saveToSentItems,
  };

  try {
    await graphClient.api(`/users/${sender}/sendMail`).post(payload);
  } catch (err: any) {
    // Graph errors often live in err.body or err.response?.data; keep it safe
    const detail =
      err?.body?.error?.message ||
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown error";
    throw new Error(`Graph sendMail failed: ${detail}`);
  }
}
