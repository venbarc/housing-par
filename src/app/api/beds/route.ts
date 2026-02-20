import { NextRequest } from "next/server";
import { adminDb } from "../../../lib/firebase/admin";
import { bedSchema } from "../../../lib/validation";
import { badRequest, created, errorResponse, ok } from "../utils";
import { logNotification } from "../notifications/helpers";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("beds").get();
    const beds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return ok(beds);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bedSchema.parse(json);

    if (parsed.patientId) {
      // ensure patient not already on another bed
      const patientSnap = await adminDb
        .collection("patients")
        .doc(parsed.patientId)
        .get();
      if (!patientSnap.exists) return badRequest("Patient not found");
      if (patientSnap.data()?.bedId) {
        return badRequest("Patient already assigned to a bed");
      }
    }

    const docRef = await adminDb.collection("beds").add({
      ...parsed,
      updatedAt: Date.now(),
    });

    if (parsed.patientId) {
      await adminDb.collection("patients").doc(parsed.patientId).update({
        bedId: docRef.id,
        status: "occupied",
        updatedAt: Date.now(),
      });
      await logNotification(
        "bed_occupied",
        `Bed ${parsed.bedNumber} assigned to patient`
      );
    }

    const createdBed = await docRef.get();
    return created({ id: docRef.id, ...createdBed.data() });
  } catch (err) {
    return errorResponse(err);
  }
}
