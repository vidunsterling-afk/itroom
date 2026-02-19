import { Schema, model, type InferSchemaType } from "mongoose";

const moduleSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    }, // e.g. "assets"
    name: { type: String, required: true, trim: true }, // e.g. "Assets"
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    actions: {
      type: [String],
      default: ["read", "create", "update", "delete"],
    }, // allowed actions
  },
  { timestamps: true },
);

export type ModuleDoc = InferSchemaType<typeof moduleSchema>;
export const ModuleDef = model("Module", moduleSchema);
