import type { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { FingerprintEnrollment } from "../models/FingerprintEnrollment";
import { FingerprintMachine } from "../models/FingerprintMachine";
import { Employee } from "../models/Employee";
import { FingerprintEvent } from "../models/FingerprintEvent";
import { writeAudit } from "../utils/audit";

export async function printFingerprintEnrollment(req: Request, res: Response) {
  const actor = (req as any).user;
  const auditCtx = (req as any).auditCtx ?? {};

  const enrollment = await FingerprintEnrollment.findById(req.params.id).lean();
  if (!enrollment) return res.status(404).json({ message: "Not found" });

  const [machine, employee] = await Promise.all([
    FingerprintMachine.findById(enrollment.machineId).lean(),
    enrollment.employeeId
      ? Employee.findById(enrollment.employeeId).lean()
      : Promise.resolve(null),
  ]);

  const personName =
    enrollment.assigneeType === "employee"
      ? employee?.fullName || "Unknown Employee"
      : enrollment.externalFullName || "External Person";

  const dept =
    enrollment.assigneeType === "employee"
      ? (employee as any)?.department || ""
      : enrollment.externalDepartment || "";

  const itOfficer = enrollment.createdByUsername || actor?.username || "IT";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${enrollment.docNumber}.pdf"`,
  );

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true,
  });
  doc.pipe(res);

  // Helper function for drawing horizontal line
  const drawLine = (y: number) => {
    doc
      .strokeColor("#cccccc")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  };

  // Company Header with Logo placeholder
  doc
    .fontSize(20)
    .fillColor("#1e293b")
    .text("ITROOM", 50, 45, { align: "left" })
    .fontSize(10)
    .fillColor("#64748b")
    .text("Corporate Fingerprint Enrollment", { align: "right" });

  drawLine(75);

  // Title and Document Info in a two-column layout
  doc
    .fontSize(16)
    .fillColor("#0f172a")
    .text("FINGERPRINT ENROLLMENT CONFIRMATION", 50, 90, {
      align: "center",
      underline: true,
    });

  // Document Metadata Box
  doc.rect(50, 120, 500, 35).fillAndStroke("#f8fafc", "#e2e8f0");

  doc
    .fillColor("#1e293b")
    .fontSize(9)
    .text(`Document No: ${enrollment.docNumber}`, 60, 130)
    .text(`Date: ${new Date().toLocaleDateString()}`, 300, 130)
    .text(`Status: ${enrollment.status.toUpperCase()}`, 450, 130);

  let yPosition = 175;

  // Machine Details Section
  doc
    .fillColor("#0f172a")
    .fontSize(12)
    .text("MACHINE DETAILS", 50, yPosition, { continued: true })
    .fontSize(8)
    .fillColor("#64748b")
    .text(" • Registered Equipment", { align: "right" });

  yPosition += 20;
  drawLine(yPosition - 5);

  // Machine Info Grid (Two columns)
  doc.fontSize(10).fillColor("#1e293b");

  // Left column
  doc
    .text("Machine Code:", 50, yPosition)
    .fillColor("#64748b")
    .text(machine?.machineCode ?? "—", 150, yPosition)
    .fillColor("#1e293b")
    .text("Machine Name:", 50, yPosition + 20)
    .fillColor("#64748b")
    .text(machine?.name ?? "—", 150, yPosition + 20)
    .fillColor("#1e293b")
    .text("Location:", 50, yPosition + 40)
    .fillColor("#64748b")
    .text(machine?.location ?? "—", 150, yPosition + 40);

  // Right column
  doc
    .fillColor("#1e293b")
    .text("Brand:", 300, yPosition)
    .fillColor("#64748b")
    .text(machine?.brand ?? "—", 380, yPosition)
    .fillColor("#1e293b")
    .text("Model:", 300, yPosition + 20)
    .fillColor("#64748b")
    .text(machine?.model ?? "—", 380, yPosition + 20)
    .fillColor("#1e293b")
    .text("Serial No:", 300, yPosition + 40)
    .fillColor("#64748b")
    .text(machine?.serialNumber ?? "—", 380, yPosition + 40);

  yPosition += 70;

  // Person Details Section
  doc
    .fillColor("#0f172a")
    .fontSize(12)
    .text("PERSON DETAILS", 50, yPosition, { continued: true })
    .fontSize(8)
    .fillColor("#64748b")
    .text(" • Enrollee Information", { align: "right" });

  yPosition += 20;
  drawLine(yPosition - 5);

  // Person Info Grid
  doc
    .fontSize(10)
    .fillColor("#1e293b")
    .text("Type:", 50, yPosition)
    .fillColor("#64748b")
    .text(
      enrollment.assigneeType === "employee" ? "Employee" : "External",
      150,
      yPosition,
    )
    .fillColor("#1e293b")
    .text("Full Name:", 50, yPosition + 20)
    .fillColor("#64748b")
    .text(personName, 150, yPosition + 20)
    .fillColor("#1e293b")
    .text("Department:", 50, yPosition + 40)
    .fillColor("#64748b")
    .text(dept || "—", 150, yPosition + 40);

  doc
    .fillColor("#1e293b")
    .text("Employee/ID No:", 300, yPosition)
    .fillColor("#64748b")
    .text(
      enrollment.assigneeType === "employee"
        ? ((employee as any)?.employeeId ?? "—")
        : enrollment.externalIdNumber || "—",
      380,
      yPosition,
    )
    .fillColor("#1e293b")
    .text("Attendance No:", 300, yPosition + 20)
    .fillColor("#64748b")
    .text(enrollment.attendanceEmployeeNo, 380, yPosition + 20);

  yPosition += 70;

  // IT Confirmation Section
  doc
    .fillColor("#0f172a")
    .fontSize(12)
    .text("IT CONFIRMATION", 50, yPosition, { continued: true })
    .fontSize(8)
    .fillColor("#64748b")
    .text(" • Technical Verification", { align: "right" });

  yPosition += 20;
  drawLine(yPosition - 5);

  doc
    .fontSize(9)
    .fillColor("#334155")
    .text(
      "IT Department confirms that fingerprint enrollment has been successfully completed on the above machine.",
      50,
      yPosition,
      { width: 500, align: "left" },
    );

  yPosition += 25;

  // IT Officer Info
  doc
    .fontSize(10)
    .fillColor("#1e293b")
    .text("IT Officer:", 50, yPosition)
    .fillColor("#64748b")
    .text(itOfficer, 150, yPosition)
    .fillColor("#1e293b")
    .text("Assigned Date:", 300, yPosition)
    .fillColor("#64748b")
    .text(new Date(enrollment.assignedAt).toLocaleDateString(), 380, yPosition);

  if (enrollment.itRemarks) {
    yPosition += 20;
    doc
      .fillColor("#1e293b")
      .text("Remarks:", 50, yPosition)
      .fillColor("#64748b")
      .text(enrollment.itRemarks, 150, yPosition);
    yPosition += 20;
  } else {
    yPosition += 25;
  }

  // Signature Section - Two columns for IT and HR
  const signatureY = yPosition;

  // IT Signature Box
  doc.rect(50, signatureY, 240, 70).fillAndStroke("#f8fafc", "#e2e8f0");

  doc
    .fillColor("#1e293b")
    .fontSize(11)
    .text("IT SIGNATURE", 60, signatureY + 10)
    .fontSize(9)
    .fillColor("#475569")
    .text("Name: _________________________", 60, signatureY + 30)
    .text("Signature: ____________________", 60, signatureY + 45)
    .text("Date: _________________________", 60, signatureY + 60);

  // HR Signature Box
  doc.rect(310, signatureY, 240, 70).fillAndStroke("#f8fafc", "#e2e8f0");

  doc
    .fillColor("#1e293b")
    .fontSize(11)
    .text("HR SIGNATURE", 320, signatureY + 10)
    .fontSize(9)
    .fillColor("#475569")
    .text("Name: _________________________", 320, signatureY + 30)
    .text("Signature: ____________________", 320, signatureY + 45)
    .text("Date: _________________________", 320, signatureY + 60);

  yPosition += 85;

  // HR Approval Text
  doc
    .fontSize(9)
    .fillColor("#334155")
    .text(
      "HR acknowledges and approves attendance registration for the above person.",
      50,
      yPosition,
      { width: 500, align: "center" },
    );

  yPosition += 20;

  // Footer with border and audit info
  drawLine(yPosition);

  doc
    .fontSize(7)
    .fillColor("#94a3b8")
    .text(
      `Generated by ITroom • Document: ${enrollment.docNumber} • Printed: ${new Date().toLocaleString()}`,
      50,
      yPosition + 5,
      { align: "center", width: 500 },
    );

  doc.end();

  // Record print event + global audit (non-blocking best-effort)
  FingerprintEvent.create({
    enrollmentId: enrollment._id,
    type: "PRINT",
    note: "Printed HR signature document",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
  }).catch(() => {});

  writeAudit({
    action: "FP_ENROLL_PRINT",
    module: "fingerprints",
    status: "SUCCESS",
    actorUserId: actor?.sub,
    actorUsername: actor?.username,
    entityType: "FingerprintEnrollment",
    entityId: String(enrollment._id),
    summary: `Printed fingerprint enrollment document ${enrollment.docNumber}`,
    after: { docNumber: enrollment.docNumber },
    ip: auditCtx.ip,
    userAgent: auditCtx.userAgent,
  }).catch(() => {});
}
