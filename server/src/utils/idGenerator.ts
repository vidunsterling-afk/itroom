import { Counter } from "../models/Counter";

function pad(num: number, width: number) {
  const s = String(num);
  return s.length >= width ? s : "0".repeat(width - s.length) + s;
}

export async function nextEmployeeId() {
  const doc = await Counter.findOneAndUpdate(
    { key: "employees" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).lean();

  const seq = doc?.seq ?? 1;
  return `EMP${pad(seq, 6)}`;
}
