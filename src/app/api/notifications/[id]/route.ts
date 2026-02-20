import { NextRequest } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { errorResponse, notFound, ok } from "../../utils";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ref = adminDb.collection("notifications").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound("Notification not found");
    await ref.update({ isRead: true });
    return ok({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ref = adminDb.collection("notifications").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound("Notification not found");
    await ref.delete();
    return ok({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
