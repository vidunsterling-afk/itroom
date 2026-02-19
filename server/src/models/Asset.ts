import { Schema, model, type InferSchemaType } from "mongoose";

const assignmentSchema = new Schema(
  {
    assigneeType: { type: String, enum: ["user", "external"], required: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    assigneeName: { type: String, required: true },
    assignedAt: { type: Date, required: true },
  },
  { _id: false },
);

const assetSchema = new Schema(
  {
    assetTag: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "laptop",
        "pc",
        "router",
        "switch",
        "server",
        "monitor",
        "printer",
        "other",
      ],
      index: true,
    },
    serialNumber: { type: String, index: true, trim: true, default: null },
    status: {
      type: String,
      required: true,
      enum: ["active", "in-repair", "retired"],
      index: true,
    },
    currentAssignment: { type: assignmentSchema, default: null },
    specs: { type: Schema.Types.Mixed, default: undefined },
    notes: { type: String, default: undefined },
  },
  { timestamps: true },
);

assetSchema.index({ createdAt: -1 });
assetSchema.index({ category: 1, status: 1, createdAt: -1 });

export type AssetDoc = InferSchemaType<typeof assetSchema>;
export const Asset = model<AssetDoc>("Asset", assetSchema);
