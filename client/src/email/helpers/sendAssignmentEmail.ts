// lib/email.ts
import { apiFetch } from "../../lib/api";

export interface AssignmentEmailData {
  token: string | null | undefined;

  // Employee information
  employee: {
    _id: string;
    employeeId: string;
    fullName: string;
    email: string;
    department?: string | null;
  };

  // Asset information
  asset: {
    _id: string;
    assetTag: string;
    name: string;
    brand: string;
    model: string;
    category: string;
    serialNumber?: string | null;
  };

  // Additional context
  note?: string | null;
  assignedBy?: string | null;
}

export async function sendAssignmentEmail(
  data: AssignmentEmailData,
): Promise<void> {
  const { token, employee, asset, note, assignedBy } = data;

  // Runtime safety guards
  if (!token) {
    console.warn("Missing token — email not sent.");
    return;
  }

  if (!employee?.email) {
    console.warn("Missing recipient email — email not sent.");
    return;
  }

  // Safe value helpers with fallbacks
  const safeEmployeeId = employee.employeeId || "Not specified";
  const safeEmployeeName = employee.fullName || "Valued Employee";
  const safeDepartment = employee.department || "Not specified";
  const safeAssetTag = asset.assetTag || "Unknown";
  const safeAssetName = asset.name || "Unnamed Asset";
  const safeBrand = asset.brand || "Unknown";
  const safeModel = asset.model || "Unknown";
  const safeCategory = asset.category || "Uncategorized";
  const safeSerialNumber = asset.serialNumber || "Not available";
  const safeAssignedBy = assignedBy || "System Administrator";
  const safeNote = note?.trim() || null;

  const subject = `Asset Assigned: ${safeAssetTag}`;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Simple Header -->
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #1f2937; margin: 0; font-size: 24px;">Asset Assignment</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">${formattedDate}</p>
      </div>

      <!-- Greeting -->
      <p style="color: #1f2937; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
        Dear <strong>${safeEmployeeName}</strong>,
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
        The following asset has been assigned to you:
      </p>

      <!-- Asset Details - Simple Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #f9fafb; border-radius: 8px;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 120px;">Asset Tag</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">${safeAssetTag}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Name</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${safeAssetName}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Brand/Model</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${safeBrand} ${safeModel}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Category</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${safeCategory}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Serial Number</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-family: monospace; ${
            !asset.serialNumber ? "font-style: italic; color: #9ca3af;" : ""
          }">${safeSerialNumber}</td>
        </tr>
        <tr>
          <td style="padding: 12px; color: #6b7280;">Employee ID</td>
          <td style="padding: 12px; color: #1f2937; ${
            !employee.employeeId ? "font-style: italic; color: #9ca3af;" : ""
          }">${safeEmployeeId}</td>
        </tr>
      </table>

      <!-- Optional Details Section -->
      <div style="margin-bottom: 20px;">
        ${
          employee.department
            ? `<p style="color: #4b5563; font-size: 14px; margin: 0 0 8px 0;"><strong>Department:</strong> ${safeDepartment}</p>`
            : ""
        }
        
        <p style="color: #4b5563; font-size: 14px; margin: 0 0 8px 0;">
          <strong>Assigned by:</strong> ${safeAssignedBy}
        </p>
      </div>

      ${
        safeNote
          ? `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>Note:</strong> ${safeNote}</p>
      </div>
      `
          : ""
      }

      <!-- Simple Footer -->
      <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This is an automated message from the ITRoom System.<br>
          © ${new Date().getFullYear()} ITRoom
        </p>
      </div>
    </div>
  `;

  await apiFetch("/api/email/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      to: employee.email,
      subject,
      html,
    }),
  });
}
