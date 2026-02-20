import { NextRequest } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { patientSchema } from "../../../../lib/validation";
import { badRequest, errorResponse, notFound, ok } from "../../utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("patients").doc(id).get();
    if (!doc.exists) return notFound("Patient not found");
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
    const parsed = patientSchema.partial().parse(json);

    // handle bed changes
    if (parsed.bedId) {
      const bedSnap = await adminDb
        .collection("beds")
        .doc(parsed.bedId)
        .get();
      if (!bedSnap.exists) return badRequest("Bed not found");
      if (bedSnap.data()?.patientId && bedSnap.data()?.patientId !== id) {
        return badRequest("Bed already occupied");
      }
    }

    const patientRef = adminDb.collection("patients").doc(id);
    const patientSnap = await patientRef.get();
    if (!patientSnap.exists) return notFound("Patient not found");

    const previousBed = patientSnap.data()?.bedId;
    if (parsed.bedId && parsed.bedId !== previousBed) {
      // free previous bed
      if (previousBed) {
        await adminDb.collection("beds").doc(previousBed).update({
          patientId: null,
          status: "available",
          updatedAt: Date.now(),
        });
      }
      await adminDb.collection("beds").doc(parsed.bedId).update({
        patientId: id,
        status: "occupied",
        updatedAt: Date.now(),
      });
    }

    if (parsed.bedId === null && previousBed) {
      await adminDb.collection("beds").doc(previousBed).update({
        patientId: null,
        status: "available",
        updatedAt: Date.now(),
      });
    }

    await patientRef.update({ ...parsed, updatedAt: Date.now() });
    const updated = await patientRef.get();
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
    const patientRef = adminDb.collection("patients").doc(id);
    const patientSnap = await patientRef.get();
    if (!patientSnap.exists) return notFound("Patient not found");
    const bedId = patientSnap.data()?.bedId;
    if (bedId) {
      await adminDb.collection("beds").doc(bedId).update({
        patientId: null,
        status: "available",
        updatedAt: Date.now(),
      });
    }
    await patientRef.delete();
    return ok({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
