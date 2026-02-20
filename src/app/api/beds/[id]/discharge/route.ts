import { NextRequest } from "next/server";
import { adminDb } from "../../../../../lib/firebase/admin";
import { errorResponse, notFound, ok } from "../../../utils";
import { logNotification } from "../../../notifications/helpers";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bedRef = adminDb.collection("beds").doc(id);
    const bedSnap = await bedRef.get();
    if (!bedSnap.exists) return notFound("Bed not found");

    const patientId = bedSnap.data()?.patientId;
    if (patientId) {
      await adminDb.collection("patients").doc(patientId).update({
        bedId: null,
        status: "discharged",
        updatedAt: Date.now(),
      });
    }

    await bedRef.update({
      patientId: null,
      status: "available",
      updatedAt: Date.now(),
    });

    await logNotification(
      "bed_vacated",
      `Bed ${bedSnap.data()?.bedNumber || id} is now available`
    );

    return ok({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
