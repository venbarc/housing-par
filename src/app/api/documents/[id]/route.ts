import { NextRequest } from "next/server";
import { adminDb, adminStorage } from "../../../../lib/firebase/admin";
import { errorResponse, notFound, ok } from "../../utils";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = adminDb.collection("documents").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return notFound("Document not found");
    const data = snap.data() as Record<string, unknown> | undefined;
    if (data?.storagePath) {
      await adminStorage.file(data.storagePath as string).delete().catch(() => null);
    }
    await docRef.delete();
    return ok({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
