import { NextRequest } from "next/server";
import { adminDb } from "../../../../../lib/firebase/admin";
import { badRequest, errorResponse, notFound, ok } from "../../../utils";
import { logNotification } from "../../../notifications/helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { patientId } = await req.json();
    if (!patientId) return badRequest("patientId required");

    const bedRef = adminDb.collection("beds").doc(id);
    const bedSnap = await bedRef.get();
    if (!bedSnap.exists) return notFound("Bed not found");
    if (bedSnap.data()?.patientId) return badRequest("Bed already occupied");

    const patientRef = adminDb.collection("patients").doc(patientId);
    const patientSnap = await patientRef.get();
    if (!patientSnap.exists) return badRequest("Patient not found");
    if (patientSnap.data()?.bedId) return badRequest("Patient already assigned");

    await bedRef.update({
      patientId,
      status: "occupied",
      updatedAt: Date.now(),
    });
    await patientRef.update({
      bedId: id,
      status: "occupied",
      updatedAt: Date.now(),
    });
    await logNotification(
      "bed_occupied",
      `Patient assigned to bed ${bedSnap.data()?.bedNumber || id}`
    );
    return ok({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
