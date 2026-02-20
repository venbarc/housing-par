import { NextRequest } from "next/server";
import { adminDb } from "../../../lib/firebase/admin";
import { notificationSchema } from "../../../lib/validation";
import { created, errorResponse, ok } from "../utils";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return ok(notifications);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = notificationSchema.parse(json);
    const ref = await adminDb.collection("notifications").add({
      ...parsed,
      createdAt: Date.now(),
    });
    const createdDoc = await ref.get();
    return created({ id: ref.id, ...createdDoc.data() });
  } catch (err) {
    return errorResponse(err);
  }
}
