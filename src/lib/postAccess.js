import Posts from "./models/posts";
import { areMutualFollows } from "./socialQueries";

export async function canViewerSeePost(viewerClerkId, post) {
  if (!post || post.status === "deleted") return false;
  const author = post.authorClerkId;
  if (viewerClerkId && viewerClerkId === author) return true;
  if (post.visibility === "public") return true;
  if (post.visibility === "private") return false;
  if (post.visibility === "friends") {
    if (!viewerClerkId) return false;
    return areMutualFollows(viewerClerkId, author);
  }
  return false;
}

export async function getPostIfVisible(postId, viewerClerkId) {
  const post = await Posts.findById(postId).lean();
  if (!post) return null;
  const ok = await canViewerSeePost(viewerClerkId, post);
  return ok ? post : null;
}
