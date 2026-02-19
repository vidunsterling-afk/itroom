import { Schema, model, type InferSchemaType } from "mongoose";

const permissionSchema = new Schema(
  {
    role: { type: String, required: true, enum: ["staff"], index: true },
    moduleKey: { type: String, required: true, index: true },
    actions: { type: [String], default: ["read"] }, // e.g. ["read","create"]
  },
  { timestamps: true },
);

permissionSchema.index({ role: 1, moduleKey: 1 }, { unique: true });

export type PermissionDoc = InferSchemaType<typeof permissionSchema>;
export const Permission = model("Permission", permissionSchema);
