import Notifications from "./models/notifications";

/**
 * @param {{
 *   recipientClerkId: string,
 *   type: 'like'|'comment'|'follow'|'friend_request'|'friend_accepted',
 *   actorClerkId: string,
 *   actorFullName: string,
 *   actorUsername?: string,
 *   actorImageUrl?: string,
 *   postId?: import('mongoose').Types.ObjectId,
 *   commentId?: import('mongoose').Types.ObjectId,
 *   snippet?: string,
 * }} opts
 */
export async function createNotification(opts) {
  const { recipientClerkId, actorClerkId } = opts;
  if (!recipientClerkId || !actorClerkId || recipientClerkId === actorClerkId) {
    return null;
  }
  try {
    return await Notifications.create(opts);
  } catch (e) {
    console.error("createNotification", e);
    return null;
  }
}
