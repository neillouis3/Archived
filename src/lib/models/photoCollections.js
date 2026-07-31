import mongoose from "mongoose";

const collectionItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    /** Stable id from /api/media item, e.g. `${postId}-${index}` */
    sourceId: { type: String },
    postId: { type: String },
    aspectRatio: { type: Number },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const photoCollectionsSchema = new mongoose.Schema(
  {
    ownerClerkId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    /** URL slug for /c/[slug], unique per owner */
    slug: { type: String, trim: true, maxlength: 96 },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    /** Optional override; otherwise first item url is used as cover */
    coverUrl: { type: String, default: "" },
    items: [collectionItemSchema],
  },
  { timestamps: true }
);

photoCollectionsSchema.index({ ownerClerkId: 1, updatedAt: -1 });
photoCollectionsSchema.index({ ownerClerkId: 1, visibility: 1 });
photoCollectionsSchema.index(
  { ownerClerkId: 1, slug: 1 },
  { unique: true, sparse: true }
);

const PhotoCollections =
  mongoose.models.photoCollections ||
  mongoose.model("photoCollections", photoCollectionsSchema);

export default PhotoCollections;
