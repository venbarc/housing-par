import { NextRequest } from "next/server";
import { adminDb } from "../../../lib/firebase/admin";
import { wardSchema } from "../../../lib/validation";
import { created, errorResponse, ok } from "../utils";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("wards").get();
    const wards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return ok(wards);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = wardSchema.parse(json);
    const ref = await adminDb.collection("wards").add(parsed);
    const createdDoc = await ref.get();
    return created({ id: ref.id, ...createdDoc.data() });
  } catch (err) {
    return errorResponse(err);
  }
}
