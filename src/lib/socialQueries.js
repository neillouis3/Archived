import Follows from "./models/follows";
import Friendships from "./models/friendships";

/** @param {string} viewerClerkId */
export async function getFollowingClerkIds(viewerClerkId) {
  const rows = await Follows.find({ followerClerkId: viewerClerkId })
    .select("followingClerkId")
    .lean();
  // Defensive: exclude self if it ever ended up in the collection
  // (self-follow should be prevented, but older data might exist).
  return rows
    .map((r) => r.followingClerkId)
    .filter((id) => id && id !== viewerClerkId);
}

/** @returns {Promise<Set<string>>} */
export async function getAcceptedFriendClerkIdsSet(viewerClerkId) {
  const rows = await Friendships.find({
    status: "accepted",
    $or: [
      { requesterClerkId: viewerClerkId },
      { recipientClerkId: viewerClerkId },
    ],
  })
    .select("requesterClerkId recipientClerkId")
    .lean();
  const ids = new Set();
  for (const r of rows) {
    ids.add(
      r.requesterClerkId === viewerClerkId
        ? r.recipientClerkId
        : r.requesterClerkId
    );
  }
  return ids;
}

export async function areFriends(a, b) {
  if (!a || !b || a === b) return false;
  const n = await Friendships.countDocuments({
    status: "accepted",
    $or: [
      { requesterClerkId: a, recipientClerkId: b },
      { requesterClerkId: b, recipientClerkId: a },
    ],
  });
  return n > 0;
}

export async function isFollowing(followerClerkId, followingClerkId) {
  const n = await Follows.countDocuments({ followerClerkId, followingClerkId });
  return n > 0;
}

/**
 * Following feed: followed users' public + friends-only from followed users who are also accepted friends.
 * @param {string} viewerClerkId
 * @param {string[]} followingIds
 * @param {Set<string>} friendIdSet
 */
export function buildFollowingFeedFilter(viewerClerkId, followingIds, friendIdSet) {
  const followedFriends = followingIds.filter((id) => friendIdSet.has(id));
  // Always exclude the viewer's own posts from the following feed (even if
  // data issues ever re-introduce self-follow or similar).
  return {
    $and: [
      { authorClerkId: { $ne: viewerClerkId } },
      {
        $or: [
          {
            $and: [
              { authorClerkId: { $in: followingIds } },
              { visibility: "public" },
            ],
          },
          {
            $and: [
              { authorClerkId: { $in: followedFriends } },
              { visibility: "friends" },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * @param {string|null|undefined} viewerClerkId
 * @param {string} authorClerkId
 * @param {boolean} isFriend
 */
export function buildAuthorPostsFilter(viewerClerkId, authorClerkId, isFriend) {
  if (viewerClerkId && viewerClerkId === authorClerkId) {
    return { authorClerkId };
  }
  if (isFriend) {
    return { authorClerkId, visibility: { $in: ["public", "friends"] } };
  }
  return { authorClerkId, visibility: "public" };
}

/**
 * @param {{
 *   authorClerkId: string | null,
 *   followingFeed: boolean,
 *   viewerClerkId: string | null | undefined,
 *   collectionVisibility: string | null,
 * }} opts
 */
export async function buildPostsListFilter(opts) {
  const {
    authorClerkId,
    followingFeed,
    viewerClerkId,
    collectionVisibility,
  } = opts;

  if (authorClerkId) {
    const friend =
      viewerClerkId && viewerClerkId !== authorClerkId
        ? await areFriends(viewerClerkId, authorClerkId)
        : false;

    const base = buildAuthorPostsFilter(
      viewerClerkId,
      authorClerkId,
      friend
    );

    if (
      collectionVisibility &&
      ["public", "friends", "private"].includes(collectionVisibility)
    ) {
      if (viewerClerkId !== authorClerkId) {
        const err = new Error("FORBIDDEN_COLLECTION");
        throw err;
      }
      return { ...base, visibility: collectionVisibility };
    }

    return base;
  }

  if (followingFeed) {
    if (!viewerClerkId) {
      const err = new Error("UNAUTHORIZED");
      throw err;
    }
    const [followingIds, friendSet] = await Promise.all([
      getFollowingClerkIds(viewerClerkId),
      getAcceptedFriendClerkIdsSet(viewerClerkId),
    ]);
    return buildFollowingFeedFilter(viewerClerkId, followingIds, friendSet);
  }

  // Discover feed (public): do not show the viewer their own posts.
  if (viewerClerkId) {
    return { visibility: "public", authorClerkId: { $ne: viewerClerkId } };
  }
  return { visibility: "public" };
}

/**
 * Posts the viewer is allowed to see (own, public, or friends-only when friends with author).
 * @param {object[]} posts
 * @param {string} viewerClerkId
 * @param {Set<string>} friendIdSet accepted friends of viewer
 */
export function filterPostsVisibleToViewer(posts, viewerClerkId, friendIdSet) {
  if (!viewerClerkId || !posts?.length) return [];
  return posts.filter((p) => {
    const author = p.authorClerkId;
    if (author === viewerClerkId) return true;
    const v = p.visibility;
    if (v === "public") return true;
    if (v === "friends") return friendIdSet.has(author);
    return false;
  });
}
