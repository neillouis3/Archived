import mongoose from "mongoose";

const postRepostsSchema = new mongoose.Schema(
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

postRepostsSchema.index({ postId: 1, clerkId: 1 }, { unique: true });
postRepostsSchema.index({ clerkId: 1, createdAt: -1 });

const PostReposts =
  mongoose.models.postReposts ||
  mongoose.model("postReposts", postRepostsSchema);

export default PostReposts;
