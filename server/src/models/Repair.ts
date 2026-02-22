import { Schema, model, type InferSchemaType } from "mongoose";

const repairSchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },

    vendorName: { type: String, required: true, trim: true, index: true },

    // financials
    cost: { type: Number, min: 0, default: 0 },

    // lifecycle
    status: {
      type: String,
      required: true,
      enum: [
        "reported",
        "sent",
        "repairing",
        "returned",
        "closed",
        "cancelled",
      ],
      index: true,
      default: "reported",
    },

    reportedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
    sentAt: { type: Date },
    returnedAt: { type: Date },
    closedAt: { type: Date },

    // details
    issue: { type: String, required: true, trim: true },
    resolution: { type: String, trim: true },

    // warranty tracking
    isWarrantyClaim: { type: Boolean, default: false, index: true },
    warrantyExpiry: { type: Date, index: true },
    warrantyProvider: { type: String, trim: true },
    notes: { type: String },
  },
  { timestamps: true },
);

repairSchema.index({ assetId: 1, createdAt: -1 });
repairSchema.index({ status: 1, reportedAt: -1 });
repairSchema.index({ vendorName: 1, reportedAt: -1 });

export type RepairDoc = InferSchemaType<typeof repairSchema>;
export const Repair = model("Repair", repairSchema);
