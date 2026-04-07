import PostLikes from "@lib/models/postLikes";
import PostSaves from "@lib/models/postSaves";
import PostComments from "@lib/models/postComments";

/**
 * Adds `engagement` to each lean post: likeCount, commentCount, likedByMe, savedByMe.
 * One batch round-trip instead of N /engagement calls from the feed.
 */
export async function embedEngagementInPosts(posts, viewerClerkId) {
  if (!posts?.length) return;

  const postIds = posts.map((p) => p._id).filter(Boolean);
  if (!postIds.length) return;

  const [likeGroups, commentGroups, likedRows, savedRows] = await Promise.all([
    PostLikes.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: "$postId", likeCount: { $sum: 1 } } },
    ]),
    PostComments.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: "$postId", commentCount: { $sum: 1 } } },
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
  ]);

  const likeMap = new Map(
    likeGroups.map((g) => [String(g._id), g.likeCount])
  );
  const commentMap = new Map(
    commentGroups.map((g) => [String(g._id), g.commentCount])
  );
  const likedSet = new Set(likedRows.map((r) => String(r.postId)));
  const savedSet = new Set(savedRows.map((r) => String(r.postId)));

  for (const p of posts) {
    const id = String(p._id);
    p.engagement = {
      likeCount: likeMap.get(id) ?? 0,
      commentCount: commentMap.get(id) ?? 0,
      likedByMe: likedSet.has(id),
      savedByMe: savedSet.has(id),
    };
  }
}
