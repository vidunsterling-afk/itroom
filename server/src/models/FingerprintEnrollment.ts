import { Schema, model, type InferSchemaType } from "mongoose";

const enrollmentSchema = new Schema(
  {
    docNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    machineId: {
      type: Schema.Types.ObjectId,
      ref: "FingerprintMachine",
      required: true,
      index: true,
    },

    assigneeType: {
      type: String,
      required: true,
      enum: ["employee", "external"],
      index: true,
    },

    // employee
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", index: true },

    // external
    externalFullName: { type: String, trim: true, index: true },
    externalDepartment: { type: String, trim: true },
    externalIdNumber: { type: String, trim: true },

    attendanceEmployeeNo: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["assigned", "pending_hr_signature", "signed", "cancelled"],
      index: true,
      default: "assigned",
    },

    assignedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },

    // HR sign
    hrSignerName: { type: String, trim: true },
    hrSignedAt: { type: Date },
    hrRemarks: { type: String, trim: true },

    itRemarks: { type: String, trim: true },

    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    createdByUsername: { type: String, index: true },
  },
  { timestamps: true },
);

enrollmentSchema.index({ machineId: 1, assignedAt: -1 });
enrollmentSchema.index({ assigneeType: 1, externalFullName: 1 });

export type FingerprintEnrollmentDoc = InferSchemaType<typeof enrollmentSchema>;
export const FingerprintEnrollment = model(
  "FingerprintEnrollment",
  enrollmentSchema,
);
