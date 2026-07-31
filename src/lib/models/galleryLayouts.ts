import mongoose, { Schema, Model } from "mongoose";

/**
 * Per-user custom order for gallery photos (media item ids like `${postId}-${index}`).
 */
export interface IGalleryLayout {
  ownerClerkId: string;
  orderedIds: string[];
}

const galleryLayoutsSchema = new Schema<IGalleryLayout>(
  {
    ownerClerkId: { type: String, required: true, unique: true, index: true },
    orderedIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

const GalleryLayouts: Model<IGalleryLayout> =
  mongoose.models.galleryLayouts ||
  mongoose.model<IGalleryLayout>("galleryLayouts", galleryLayoutsSchema);

export default GalleryLayouts;