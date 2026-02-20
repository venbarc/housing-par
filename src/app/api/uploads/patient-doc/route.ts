import { NextRequest } from "next/server";
import { adminDb, adminStorage } from "../../../../lib/firebase/admin";
import { badRequest, created, errorResponse } from "../../utils";
import { v4 as uuid } from "uuid";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const patientId = formData.get("patientId") as string | null;

    if (!file) return badRequest("file required");
    if (!patientId) return badRequest("patientId required");

    const patientSnap = await adminDb.collection("patients").doc(patientId).get();
    if (!patientSnap.exists) return badRequest("Patient not found");

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "";
    const path = `patients/${patientId}/${uuid()}.${ext}`;

    const uploadMax = Number(process.env.UPLOAD_MAX_MB || "20");
    if (bytes.length > uploadMax * 1024 * 1024) {
      return badRequest(`File exceeds ${uploadMax}MB limit`);
    }

    const bucketFile = adminStorage.file(path);
    await bucketFile.save(bytes, { contentType: file.type, resumable: false });
    const [url] = await bucketFile.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });

    const docRef = await adminDb.collection("documents").add({
      patientId,
      fileName: file.name,
      fileType: file.type,
      fileSize: bytes.length,
      storagePath: path,
      fileUrl: url,
      uploadedAt: Date.now(),
    });

    return created({ id: docRef.id, fileUrl: url, storagePath: path });
  } catch (err) {
    return errorResponse(err);
  }
}
