/**
 * One-off: remove posts that have no usable image URLs (empty/missing media
 * or only blank URLs). Run from repo root:
 *
 *   cd milestone && npm run db:delete-posts-without-media
 *
 * Requires MONGODB_URL (see .env). Uses Node 20+ --env-file in npm script.
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URL;
if (!uri) {
  console.error("Missing MONGODB_URL in environment.");
  process.exit(1);
}

/** Matches posts with no media item whose `url` contains a non-whitespace character. */
const filter = {
  $nor: [{ media: { $elemMatch: { url: { $regex: /\S/ } } } }],
};

const postsSchema = new mongoose.Schema({}, { strict: false, collection: "posts" });
const Posts =
  mongoose.models._DeletePostsWithoutMedia ||
  mongoose.model("_DeletePostsWithoutMedia", postsSchema);

await mongoose.connect(uri);
const res = await Posts.deleteMany(filter);
console.log(`Deleted ${res.deletedCount} post(s) with no images.`);
await mongoose.disconnect();
