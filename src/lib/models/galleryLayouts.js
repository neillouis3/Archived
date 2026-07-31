import mongoose from "mongoose";

/**
 * Per-user custom order for gallery photos (media item ids like `${postId}-${index}`).
 */
const galleryLayoutsSchema = new mongoose.Schema(
  {
    ownerClerkId: { type: String, required: true, unique: true, index: true },
    orderedIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

const GalleryLayouts =
  mongoose.models.galleryLayouts ||
  mongoose.model("galleryLayouts", galleryLayoutsSchema);

export default GalleryLayouts;
