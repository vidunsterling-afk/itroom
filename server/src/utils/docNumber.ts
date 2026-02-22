import { FingerprintEnrollment } from "../models/FingerprintEnrollment";

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

export async function generateFingerprintDocNumber(now = new Date()) {
  const year = now.getFullYear();
  const prefix = `FP-${year}-`;

  // find latest doc number for the year
  const last = await FingerprintEnrollment.findOne({
    docNumber: { $regex: `^${prefix}` },
  })
    .sort({ createdAt: -1 })
    .select({ docNumber: 1 })
    .lean();

  let nextSeq = 1;
  if (last?.docNumber) {
    const parts = last.docNumber.split("-");
    if (parts.length === 3) {
      const seq = Number(parts[2]);
      if (!Number.isNaN(seq)) nextSeq = seq + 1;
    }
  }

  return `${prefix}${pad(nextSeq, 5)}`;
}
