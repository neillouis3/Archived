import PostLikes from "@lib/models/postLikes";
import PostSaves from "@lib/models/postSaves";
import PostComments from "@lib/models/postComments";
import PostReposts from "@lib/models/postReposts";

/**
 * Adds `engagement` to each lean post:
 * likeCount, commentCount, repostCount, likedByMe, savedByMe, repostedByMe.
 */
export async function embedEngagementInPosts(posts, viewerClerkId) {
  if (!posts?.length) return;

  const postIds = posts.map((p) => p._id).filter(Boolean);
  if (!postIds.length) return;

  const [
    likeGroups,
    commentGroups,
    repostGroups,
    likedRows,
    savedRows,
    repostedRows,
  ] = await Promise.all([
    PostLikes.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: "$postId", likeCount: { $sum: 1 } } },
    ]),
    PostComments.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: "$postId", commentCount: { $sum: 1 } } },
    ]),
    PostReposts.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: "$postId", repostCount: { $sum: 1 } } },
    ]),
    viewerClerkId
      ? PostLikes.find({ postId: { $in: postIds }, clerkId: viewerClerkId })
          .select("postId")
          .lean()
      : [],
    viewerClerkId
      ? PostSaves.find({ postId: { $in: postIds }, clerkId: viewerClerkId })
          .select("postId")
          .lean()
      : [],
    viewerClerkId
      ? PostReposts.find({ postId: { $in: postIds }, clerkId: viewerClerkId })
          .select("postId")
          .lean()
      : [],
  ]);

  const likeMap = new Map(
    likeGroups.map((g) => [String(g._id), g.likeCount])
  );
  const commentMap = new Map(
    commentGroups.map((g) => [String(g._id), g.commentCount])
  );
  const repostMap = new Map(
    repostGroups.map((g) => [String(g._id), g.repostCount])
  );
  const likedSet = new Set(likedRows.map((r) => String(r.postId)));
  const savedSet = new Set(savedRows.map((r) => String(r.postId)));
  const repostedSet = new Set(repostedRows.map((r) => String(r.postId)));

  for (const p of posts) {
    const id = String(p._id);
    p.engagement = {
      likeCount: likeMap.get(id) ?? 0,
      commentCount: commentMap.get(id) ?? 0,
      repostCount: repostMap.get(id) ?? 0,
      likedByMe: likedSet.has(id),
      savedByMe: savedSet.has(id),
      repostedByMe: repostedSet.has(id),
    };
  }
}
