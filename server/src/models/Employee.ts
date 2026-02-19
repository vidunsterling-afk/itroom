import { Schema, model, type InferSchemaType } from "mongoose";

const employeeSchema = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    fullName: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    department: { type: String, trim: true, index: true },
    title: { type: String, trim: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

employeeSchema.index({ fullName: "text", employeeId: "text" });

export type EmployeeDoc = InferSchemaType<typeof employeeSchema>;
export const Employee = model("Employee", employeeSchema);
