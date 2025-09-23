import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  clerkId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postsSchema = new mongoose.Schema({
  authorClerkId: { type: String, required: true },
  title: String,
  body: { type: String, required: true },
  media: [mediaSchema],
  tags: [String],
  visibility: { type: String, default: "public" },
  pinned: { type: Boolean, default: false },
  status: { type: String, default: "active" },
}, { timestamps: true });



const Posts = mongoose.models.posts || mongoose.model("posts", postsSchema)

export default Posts