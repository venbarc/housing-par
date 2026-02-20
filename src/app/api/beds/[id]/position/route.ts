import { NextRequest } from "next/server";
import { adminDb } from "../../../../../lib/firebase/admin";
import { bedPositionSchema } from "../../../../../lib/validation";
import { errorResponse, notFound, ok } from "../../../utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = bedPositionSchema.parse(json);
    const ref = adminDb.collection("beds").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound("Bed not found");
    await ref.update({ ...parsed, updatedAt: Date.now() });
    return ok({ id, ...snap.data(), ...parsed });
  } catch (err) {
    return errorResponse(err);
  }
}
