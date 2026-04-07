import mongoose from "mongoose";

const postSavesSchema = new mongoose.Schema(
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

postSavesSchema.index({ postId: 1, clerkId: 1 }, { unique: true });

const PostSaves =
  mongoose.models.postSaves || mongoose.model("postSaves", postSavesSchema);

export default PostSaves;
