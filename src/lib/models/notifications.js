import mongoose from "mongoose";

const notificationsSchema = new mongoose.Schema(
  {
    recipientClerkId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        "like",
        "comment",
        "follow",
        "friend_request",
        "friend_accepted",
        "repost",
      ],
      required: true,
    },
    actorClerkId: { type: String, required: true },
    actorFullName: { type: String, required: true },
    actorUsername: { type: String },
    actorImageUrl: { type: String },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "posts" },
    commentId: { type: mongoose.Schema.Types.ObjectId },
    snippet: { type: String },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationsSchema.index({ recipientClerkId: 1, read: 1, createdAt: -1 });
notificationsSchema.index({ recipientClerkId: 1, createdAt: -1 });

const Notifications =
  mongoose.models.notifications ||
  mongoose.model("notifications", notificationsSchema);

export default Notifications;
