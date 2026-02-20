import { adminDb } from "../../../lib/firebase/admin";
import { NotificationType } from "../../../types";

export async function logNotification(
  type: NotificationType,
  message: string
) {
  await adminDb.collection("notifications").add({
    type,
    message,
    isRead: false,
    createdAt: Date.now(),
  });
}
