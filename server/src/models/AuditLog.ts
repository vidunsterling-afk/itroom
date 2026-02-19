import { Schema, model, Types, type InferSchemaType } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorUsername: { type: String, index: true },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    entityType: { type: String },
    entityId: { type: String, index: true },
    summary: { type: String },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["SUCCESS", "FAIL"],
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// performance indexes for audit searching
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ actorUserId: 1, createdAt: -1 });
auditLogSchema.index({ entityId: 1, createdAt: -1 });

export type AuditLogDoc = InferSchemaType<typeof auditLogSchema>;
export const AuditLog = model("AuditLog", auditLogSchema);
