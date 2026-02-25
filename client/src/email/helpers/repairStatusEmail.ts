/* eslint-disable @typescript-eslint/no-explicit-any */
// email/helpers/repairStatusEmail.ts
import { apiFetch } from "../../lib/api";

export async function sendRepairStatusChangedEmail(data: {
  token: string | null | undefined;
  to: string;
  createdBy?: string | null;
  asset: any;
  repair: any;
  oldStatus: string;
  newStatus: string;
}) {
  const { token, to, createdBy, asset, repair, oldStatus, newStatus } = data;
  if (!token || !to) return;

  const subject = `Repair Status Updated: ${asset.assetTag} (${oldStatus} → ${newStatus})`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="margin:0 0 8px 0;color:#111827;">Repair Status Updated</h2>
      <p style="margin:0 0 18px 0;color:#6b7280;">${new Date().toLocaleString()}</p>

      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:140px;">Asset</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;font-weight:600;">
            ${asset.assetTag} — ${asset.name}
          </td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Vendor</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;">${repair.vendorName}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Status</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;">
            <strong>${oldStatus}</strong> → <strong>${newStatus}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Issue</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;">${repair.issue}</td>
        </tr>
      </table>

      <p style="margin:14px 0 0 0;color:#6b7280;font-size:13px;">
        Updated by: <strong style="color:#374151;">${createdBy || "System"}</strong>
      </p>
    </div>
  `;

  await apiFetch("/api/email/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to, subject, html }),
  });
}
