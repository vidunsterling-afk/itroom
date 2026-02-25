// lib/repairEmail.ts
import { apiFetch } from "../../lib/api";

export interface RepairCreatedEmailData {
  token: string | null | undefined;

  repair: {
    _id: string;
    assetId: string;
    vendorName: string;
    cost: number;
    status: string;
    reportedAt: string; // ISO
    issue: string;
    isWarrantyClaim: boolean;
    warrantyExpiry?: string | null;
    warrantyProvider?: string | null;
    notes?: string | null;
  };

  asset: {
    _id: string;
    assetTag: string;
    name: string;
    brand: string;
    model: string;
    category: string;
    serialNumber?: string | null;
  };

  to: string; // who receives it (IT, manager, etc.)
  createdBy?: string | null;
}

export async function sendRepairCreatedEmail(
  data: RepairCreatedEmailData,
): Promise<void> {
  const { token, repair, asset, to, createdBy } = data;

  if (!token) return;
  if (!to) return;

  const subject = `Repair Logged: ${asset.assetTag} • ${repair.status.toUpperCase()}`;

  const formattedDate = new Date(repair.reportedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const safe = {
    assetTag: asset.assetTag || "Unknown",
    assetName: asset.name || "Unnamed Asset",
    brand: asset.brand || "Unknown",
    model: asset.model || "Unknown",
    serial: asset.serialNumber || "Not available",
    vendor: repair.vendorName || "Not specified",
    cost: Number.isFinite(repair.cost) ? repair.cost.toFixed(2) : "0.00",
    status: repair.status || "reported",
    issue: repair.issue || "Not provided",
    warranty: repair.isWarrantyClaim ? "Yes" : "No",
    warrantyProvider: repair.warrantyProvider || "Not specified",
    warrantyExpiry: repair.warrantyExpiry
      ? new Date(repair.warrantyExpiry).toLocaleDateString("en-US")
      : "Not specified",
    createdBy: createdBy || "System",
    notes: repair.notes?.trim() || "",
  };

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="border-bottom:2px solid #f59e0b;padding-bottom:16px;margin-bottom:20px;">
        <h1 style="margin:0;color:#111827;font-size:22px;">Repair Created</h1>
        <p style="margin:6px 0 0 0;color:#6b7280;">${formattedDate}</p>
      </div>

      <p style="margin:0 0 14px 0;color:#374151;font-size:15px;">
        A repair record was created for the following asset:
      </p>

      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:140px;">Asset</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;font-weight:600;">
            ${safe.assetTag} — ${safe.assetName}
          </td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Brand / Model</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;">${safe.brand} ${safe.model}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Serial</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;font-family:monospace;">${safe.serial}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Vendor</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;">${safe.vendor}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Status</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;">${safe.status}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Cost</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;">$${safe.cost}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Issue</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;">${safe.issue}</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Warranty</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;">
            ${safe.warranty}
            ${
              repair.isWarrantyClaim
                ? ` • Provider: ${safe.warrantyProvider} • Expiry: ${safe.warrantyExpiry}`
                : ""
            }
          </td>
        </tr>
      </table>

      ${
        safe.notes
          ? `<div style="margin-top:16px;background:#fffbeb;border-left:4px solid #f59e0b;padding:12px;">
               <p style="margin:0;color:#92400e;font-size:14px;"><strong>Notes:</strong> ${safe.notes}</p>
             </div>`
          : ""
      }

      <p style="margin:18px 0 0 0;color:#6b7280;font-size:13px;">
        Created by: <strong style="color:#374151;">${safe.createdBy}</strong>
      </p>

      <div style="border-top:1px solid #e5e7eb;margin-top:22px;padding-top:14px;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">
          Automated message from ITRoom System • © ${new Date().getFullYear()} ITRoom
        </p>
      </div>
    </div>
  `;

  await apiFetch("/api/email/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to, subject, html }),
  });
}
