import { Schema, model, type InferSchemaType } from "mongoose";

const fingerprintEventSchema = new Schema(
  {
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: "FingerprintEnrollment",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["CREATE", "STATUS_CHANGE", "PRINT", "UPDATE"],
      index: true,
    },

    note: { type: String, trim: true },

    actorUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorUsername: { type: String, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

fingerprintEventSchema.index({ enrollmentId: 1, createdAt: -1 });

export type FingerprintEventDoc = InferSchemaType<
  typeof fingerprintEventSchema
>;
export const FingerprintEvent = model(
  "FingerprintEvent",
  fingerprintEventSchema,
);
