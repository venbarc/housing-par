import { NextRequest } from "next/server";
import { adminDb } from "../../../lib/firebase/admin";
import { patientSchema } from "../../../lib/validation";
import { badRequest, created, errorResponse, ok } from "../utils";
import { logNotification } from "../notifications/helpers";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("patients").get();
    const patients = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return ok(patients);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = patientSchema.parse(json);

    if (parsed.bedId) {
      const bedRef = adminDb.collection("beds").doc(parsed.bedId);
      const bedSnap = await bedRef.get();
      if (!bedSnap.exists) return badRequest("Bed not found");
      if (bedSnap.data()?.patientId) return badRequest("Bed already occupied");
    }

    const ref = await adminDb.collection("patients").add({
      ...parsed,
      updatedAt: Date.now(),
    });

    if (parsed.bedId) {
      await adminDb.collection("beds").doc(parsed.bedId).update({
        patientId: ref.id,
        status: "occupied",
        updatedAt: Date.now(),
      });
    }

    await logNotification("admission", `New patient admitted: ${parsed.name}`);

    const createdDoc = await ref.get();
    return created({ id: ref.id, ...createdDoc.data() });
  } catch (err) {
    return errorResponse(err);
  }
}
