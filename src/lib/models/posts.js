import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  clerkId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postsSchema = new mongoose.Schema({
  authorClerkId: { type: String, required: true },
  fullName: { type: String, required: true },
  username: { type: String, required: true },
  avatarUrl: { type: String },
  title: { type: String },
  body: { type: String, default: "" },
  location: { type: String },
  media: [mediaSchema],
  tags: [String],
  visibility: {
    type: String,
    enum: ["public", "friends", "private"],
    default: "public",
  },
  /** Display frame: 4/5, 1, 5/4, or 16/9 */
  aspectRatio: { type: Number },
  hideLikeCount: { type: Boolean, default: false },
  commentsDisabled: { type: Boolean, default: false },
  altText: { type: String },
  pinned: { type: Boolean, default: false },
  status: { type: String, default: "active" },
}, { timestamps: true });

postsSchema.index({ authorClerkId: 1, createdAt: -1 });
postsSchema.index({ visibility: 1, createdAt: -1 });
postsSchema.index({ createdAt: -1 });

const Posts = mongoose.models.posts || mongoose.model("posts", postsSchema)

export default Posts