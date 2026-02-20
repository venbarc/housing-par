import { NextRequest } from "next/server";
import { adminDb } from "../../../lib/firebase/admin";
import { documentMetadataSchema } from "../../../lib/validation";
import { created, errorResponse, ok } from "../utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const col = adminDb.collection("documents");
    const snapshot = patientId
      ? await col.where("patientId", "==", patientId).get()
      : await col.get();
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return ok(docs);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = documentMetadataSchema.parse(json);
    const ref = await adminDb.collection("documents").add({
      ...parsed,
      uploadedAt: Date.now(),
    });
    const createdDoc = await ref.get();
    return created({ id: ref.id, ...createdDoc.data() });
  } catch (err) {
    return errorResponse(err);
  }
}
