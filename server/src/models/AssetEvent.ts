import { Schema, model, type InferSchemaType } from "mongoose";

const assetEventSchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["ASSIGN", "UNASSIGN", "STATUS_CHANGE", "UPDATE_DETAILS"],
      index: true,
    },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    note: { type: String },
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorUsername: { type: String, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

assetEventSchema.index({ assetId: 1, createdAt: -1 });

export type AssetEventDoc = InferSchemaType<typeof assetEventSchema>;
export const AssetEvent = model("AssetEvent", assetEventSchema);
