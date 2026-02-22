import { Schema, model, type InferSchemaType } from "mongoose";

const licenseAssignmentSchema = new Schema(
  {
    licenseId: {
      type: Schema.Types.ObjectId,
      ref: "License",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    seatCount: { type: Number, default: 1, min: 1 },

    assignedAt: { type: Date, required: true, default: () => new Date() },
    unassignedAt: { type: Date, default: null },

    note: { type: String },

    actorUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorUsername: { type: String, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

licenseAssignmentSchema.index(
  { licenseId: 1, employeeId: 1, unassignedAt: 1 },
  { unique: true, partialFilterExpression: { unassignedAt: null } },
);

licenseAssignmentSchema.index({ licenseId: 1, createdAt: -1 });

export type LicenseAssignmentDoc = InferSchemaType<
  typeof licenseAssignmentSchema
>;
export const LicenseAssignment = model(
  "LicenseAssignment",
  licenseAssignmentSchema,
);
