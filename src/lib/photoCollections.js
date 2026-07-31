import PhotoCollections from "@lib/models/photoCollections";
import { areMutualFollows } from "@lib/socialQueries";

const VIS = ["public", "friends", "private"];

/** Turn a collection name into a URL slug: "Summer 2026" → "summer-2026" */
export function slugifyCollectionName(name) {
  const base = String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "collection";
}

/**
 * Ensure slug is unique for this owner. Appends -2, -3, … on collision.
 * @param {string} ownerClerkId
 * @param {string} name
 * @param {string | null | undefined} excludeId
 */
export async function allocateCollectionSlug(
  ownerClerkId,
  name,
  excludeId = null
) {
  const base = slugifyCollectionName(name);
  let candidate = base;
  let n = 2;
  while (true) {
    const filter = { ownerClerkId, slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await PhotoCollections.exists(filter);
    if (!exists) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 200) return `${base}-${Date.now().toString(36)}`;
  }
}

/**
 * @param {string | null | undefined} viewerClerkId
 * @param {string} ownerClerkId
 * @param {boolean} friend
 */
export function buildCollectionsVisibilityFilter(
  viewerClerkId,
  ownerClerkId,
  friend
) {
  if (viewerClerkId && viewerClerkId === ownerClerkId) {
    return { ownerClerkId };
  }
  if (friend) {
    return {
      ownerClerkId,
      visibility: { $in: ["public", "friends"] },
    };
  }
  return { ownerClerkId, visibility: "public" };
}

/**
 * @param {Record<string, unknown> | null | undefined} doc
 * @param {string | null | undefined} viewerClerkId
 */
export async function canViewerSeeCollection(doc, viewerClerkId) {
  if (!doc) return false;
  const ownerClerkId = String(doc.ownerClerkId || "");
  const visibility = String(doc.visibility || "public");
  if (viewerClerkId && viewerClerkId === ownerClerkId) return true;
  if (visibility === "public") return true;
  if (visibility === "private") return false;
  if (visibility === "friends") {
    if (!viewerClerkId) return false;
    return areMutualFollows(viewerClerkId, ownerClerkId);
  }
  return false;
}

export function isValidVisibility(value) {
  return typeof value === "string" && VIS.includes(value);
}

export function serializeCollection(doc, { includeItems = false } = {}) {
  const plain =
    typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  const items = Array.isArray(plain.items) ? plain.items : [];
  const previewUrls = items
    .map((item) => (typeof item?.url === "string" ? item.url.trim() : ""))
    .filter(Boolean)
    .slice(0, 4);

  const coverUrl =
    (typeof plain.coverUrl === "string" && plain.coverUrl.trim()) ||
    previewUrls[0] ||
    "";

  const name = String(plain.name || "");
  const slug =
    (typeof plain.slug === "string" && plain.slug.trim()) ||
    slugifyCollectionName(name);

  const base = {
    id: String(plain._id),
    ownerClerkId: String(plain.ownerClerkId),
    name,
    slug,
    description: String(plain.description || ""),
    visibility: isValidVisibility(plain.visibility)
      ? plain.visibility
      : "public",
    coverUrl,
    previewUrls,
    itemCount: items.length,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };

  if (!includeItems) return base;

  return {
    ...base,
    items: items.map((item) => ({
      id: String(item._id),
      url: String(item.url || ""),
      sourceId: item.sourceId ? String(item.sourceId) : null,
      postId: item.postId ? String(item.postId) : null,
      aspectRatio:
        typeof item.aspectRatio === "number" && item.aspectRatio > 0
          ? item.aspectRatio
          : null,
      addedAt: item.addedAt,
    })),
  };
}

export { PhotoCollections, VIS as COLLECTION_VISIBILITIES };
