import { Schema, model, type InferSchemaType } from "mongoose";

const assignmentSchema = new Schema(
  {
    assigneeType: {
      type: String,
      enum: ["employee", "external"],
      required: true,
    },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee" }, // only if employee
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

    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },

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
    serialNumber: { type: String, index: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "in-repair", "retired"],
      index: true,
    },
    currentAssignment: { type: assignmentSchema, default: null },
    specs: { type: Schema.Types.Mixed },
    notes: { type: String },
  },
  { timestamps: true },
);

assetSchema.index({ createdAt: -1 });
assetSchema.index({ category: 1, status: 1, createdAt: -1 });
assetSchema.index({ brand: 1, model: 1 });

export type AssetDoc = InferSchemaType<typeof assetSchema>;
export const Asset = model("Asset", assetSchema);
