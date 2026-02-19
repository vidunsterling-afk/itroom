import { Schema, model, type InferSchemaType } from "mongoose";

const counterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export type CounterDoc = InferSchemaType<typeof counterSchema>;
export const Counter = model("Counter", counterSchema);
