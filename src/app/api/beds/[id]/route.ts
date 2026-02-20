import { NextRequest } from "next/server";
import { adminDb } from "../../../../lib/firebase/admin";
import { bedSchema } from "../../../../lib/validation";
import { badRequest, errorResponse, notFound, ok } from "../../utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("beds").doc(id).get();
    if (!doc.exists) return notFound("Bed not found");
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
    const parsed = bedSchema.partial().parse(json);

    const bedRef = adminDb.collection("beds").doc(id);
    const bedSnap = await bedRef.get();
    if (!bedSnap.exists) return notFound("Bed not found");

    // handle patient assignment changes
    if (parsed.patientId && bedSnap.data()?.patientId !== parsed.patientId) {
      const patientSnap = await adminDb
        .collection("patients")
        .doc(parsed.patientId)
        .get();
      if (!patientSnap.exists) return badRequest("Patient not found");
      if (patientSnap.data()?.bedId) {
        return badRequest("Patient already assigned to another bed");
      }
      await patientSnap.ref.update({
        bedId: id,
        status: "occupied",
        updatedAt: Date.now(),
      });
    }

    if (parsed.patientId === null) {
      // clear patient if set to null
      const existingPatient = bedSnap.data()?.patientId;
      if (existingPatient) {
        await adminDb.collection("patients").doc(existingPatient).update({
          bedId: null,
          updatedAt: Date.now(),
        });
      }
    }

    await bedRef.update({ ...parsed, updatedAt: Date.now() });
    const updated = await bedRef.get();
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
    const bedRef = adminDb.collection("beds").doc(id);
    const bedSnap = await bedRef.get();
    if (!bedSnap.exists) return notFound("Bed not found");
    if (bedSnap.data()?.patientId) {
      return badRequest("Cannot delete bed with assigned patient");
    }
    await bedRef.delete();
    return ok({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
