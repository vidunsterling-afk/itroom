import { Schema, model, type InferSchemaType } from "mongoose";

const fingerprintMachineSchema = new Schema(
  {
    machineCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true, index: true },

    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    serialNumber: { type: String, trim: true },

    deviceId: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    port: { type: Number, min: 1, max: 65535 },

    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

fingerprintMachineSchema.index({ createdAt: -1 });

export type FingerprintMachineDoc = InferSchemaType<
  typeof fingerprintMachineSchema
>;
export const FingerprintMachine = model(
  "FingerprintMachine",
  fingerprintMachineSchema,
);
