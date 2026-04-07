import mongoose from "mongoose";

const postCommentsSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
      index: true,
    },
    authorClerkId: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    username: { type: String, default: "" },
    avatarUrl: { type: String },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

postCommentsSchema.index({ postId: 1, createdAt: -1 });

const PostComments =
  mongoose.models.postComments ||
  mongoose.model("postComments", postCommentsSchema);

export default PostComments;
