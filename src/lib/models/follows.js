import mongoose from "mongoose";

const followsSchema = new mongoose.Schema(
  {
    followerClerkId: { type: String, required: true, index: true },
    followingClerkId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

followsSchema.index(
  { followerClerkId: 1, followingClerkId: 1 },
  { unique: true }
);

const Follows =
  mongoose.models.follows || mongoose.model("follows", followsSchema);

export default Follows;
