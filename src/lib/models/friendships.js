import mongoose from "mongoose";

const friendshipsSchema = new mongoose.Schema(
  {
    requesterClerkId: { type: String, required: true, index: true },
    recipientClerkId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

friendshipsSchema.index(
  { requesterClerkId: 1, recipientClerkId: 1 },
  { unique: true }
);
friendshipsSchema.index({ recipientClerkId: 1, status: 1 });
friendshipsSchema.index({ requesterClerkId: 1, status: 1 });

const Friendships =
  mongoose.models.friendships ||
  mongoose.model("friendships", friendshipsSchema);

export default Friendships;
