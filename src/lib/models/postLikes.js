import mongoose from "mongoose";

const postLikesSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
      index: true,
    },
    clerkId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

postLikesSchema.index({ postId: 1, clerkId: 1 }, { unique: true });

const PostLikes =
  mongoose.models.postLikes || mongoose.model("postLikes", postLikesSchema);

export default PostLikes;
