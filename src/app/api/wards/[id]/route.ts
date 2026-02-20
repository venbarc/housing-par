import { NextRequest } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { wardSchema } from "../../../../lib/validation";
import { errorResponse, notFound, ok } from "../../utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("wards").doc(id).get();
    if (!doc.exists) return notFound("Ward not found");
    return ok({ id: doc.id, ...doc.data() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = wardSchema.partial().parse(json);
    const ref = adminDb.collection("wards").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound("Ward not found");
    await ref.update(parsed);
    const updated = await ref.get();
    return ok({ id: updated.id, ...updated.data() });
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
    const ref = adminDb.collection("wards").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound("Ward not found");
    await ref.delete();
    return ok({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
