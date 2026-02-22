import { Schema, model, type InferSchemaType } from "mongoose";

const licenseSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true, index: true },
    vendor: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["subscription", "perpetual"],
      index: true,
    },

    seatsTotal: { type: Number, required: true, min: 0 },
    seatsUsed: { type: Number, required: true, min: 0, default: 0 },

    expiresAt: { type: Date, index: true },
    renewalAt: { type: Date, index: true },

    notes: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

licenseSchema.index({ createdAt: -1 });
licenseSchema.index({ vendor: 1, name: 1 });

export type LicenseDoc = InferSchemaType<typeof licenseSchema>;
export const License = model("License", licenseSchema);
