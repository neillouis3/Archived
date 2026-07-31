import Follows from "./models/follows";

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

/**
 * Mutual follows — Instagram-style stand-in for “friends” visibility.
 * People the viewer follows who also follow the viewer back.
 * @returns {Promise<Set<string>>}
 */
export async function getMutualFollowClerkIdsSet(viewerClerkId) {
  if (!viewerClerkId) return new Set();

  const [following, followers] = await Promise.all([
    Follows.find({ followerClerkId: viewerClerkId })
      .select("followingClerkId")
      .lean(),
    Follows.find({ followingClerkId: viewerClerkId })
      .select("followerClerkId")
      .lean(),
  ]);

  const followingSet = new Set(
    following
      .map((r) => r.followingClerkId)
      .filter((id) => id && id !== viewerClerkId)
  );
  const ids = new Set();
  for (const r of followers) {
    const id = r.followerClerkId;
    if (id && id !== viewerClerkId && followingSet.has(id)) {
      ids.add(id);
    }
  }
  return ids;
}

/** Mutual follow (both directions). Used for “friends” visibility. */
export async function areMutualFollows(a, b) {
  if (!a || !b || a === b) return false;
  const [aFollowsB, bFollowsA] = await Promise.all([
    isFollowing(a, b),
    isFollowing(b, a),
  ]);
  return aFollowsB && bFollowsA;
}

export async function isFollowing(followerClerkId, followingClerkId) {
  const n = await Follows.countDocuments({ followerClerkId, followingClerkId });
  return n > 0;
}

/**
 * Following feed: followed users' public + friends-only from mutual follows.
 * @param {string} viewerClerkId
 * @param {string[]} followingIds
 * @param {Set<string>} friendIdSet mutual follows of viewer
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
 *   suggestedFeed?: boolean,
 *   viewerClerkId: string | null | undefined,
 *   collectionVisibility: string | null,
 * }} opts
 */
export async function buildPostsListFilter(opts) {
  const {
    authorClerkId,
    followingFeed,
    suggestedFeed,
    viewerClerkId,
    collectionVisibility,
  } = opts;

  if (authorClerkId) {
    const friend =
      viewerClerkId && viewerClerkId !== authorClerkId
        ? await areMutualFollows(viewerClerkId, authorClerkId)
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
      getMutualFollowClerkIdsSet(viewerClerkId),
    ]);
    return buildFollowingFeedFilter(viewerClerkId, followingIds, friendSet);
  }

  // Suggested: public posts from people you don't follow.
  if (suggestedFeed) {
    if (!viewerClerkId) {
      return { visibility: "public" };
    }
    const followingIds = await getFollowingClerkIds(viewerClerkId);
    return {
      visibility: "public",
      authorClerkId: { $nin: [...followingIds, viewerClerkId] },
    };
  }

  // Discover feed (public): do not show the viewer their own posts.
  if (viewerClerkId) {
    return { visibility: "public", authorClerkId: { $ne: viewerClerkId } };
  }
  return { visibility: "public" };
}

/**
 * Posts the viewer is allowed to see (own, public, or friends-only when mutual follow).
 * @param {object[]} posts
 * @param {string} viewerClerkId
 * @param {Set<string>} friendIdSet mutual follows of viewer
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
