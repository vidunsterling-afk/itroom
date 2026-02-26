import { Schema, model, type InferSchemaType } from "mongoose";

const EmailLogSchema = new Schema(
  {
    to: { type: [String], required: true },
    cc: { type: [String], default: [] },
    subject: { type: String, required: true },

    status: { type: String, enum: ["SENT", "FAILED"], required: true },
    error: { type: String }, // only when FAILED

    // optional: keep for dashboard filters
    module: { type: String }, // e.g. "repairs", "assets"
    entityType: { type: String }, // e.g. "Repair"
    entityId: { type: String }, // e.g. repairId

    // TTL field (Mongo will delete when this time is reached)
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

// ✅ TTL index: delete doc when expiresAt < now
EmailLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type EmailLog = InferSchemaType<typeof EmailLogSchema>;
export const EmailLogModel = model("EmailLog", EmailLogSchema);
