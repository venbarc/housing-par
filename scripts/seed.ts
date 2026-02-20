import { adminDb } from "../src/lib/firebase/admin";

async function run() {
  const wards = [
    { name: "A", floor: "1", description: "General ward" },
    { name: "B", floor: "2", description: "Surgical" },
  ];

  const wardDocs = await Promise.all(
    wards.map((w) => adminDb.collection("wards").add(w))
  );

  const beds = Array.from({ length: 10 }).map((_, i) => ({
    bedNumber: `B-${i + 1}`,
    wardId: wards[i % wards.length].name,
    room: `${101 + i}`,
    status: "available",
    posX: 40 + (i % 5) * 120,
    posY: 40 + Math.floor(i / 5) * 160,
    patientId: null,
    updatedAt: Date.now(),
  }));

  const bedRefs = await Promise.all(
    beds.map((b) => adminDb.collection("beds").add(b))
  );

  const patients = [
    {
      name: "Alice Smith",
      age: 54,
      gender: "Female",
      diagnosis: "Pneumonia",
      status: "recovering",
      doctor: "Dr. Patel",
      admissionDate: new Date().toISOString(),
      contact: "555-1000",
      notes: "Antibiotics IV",
      bedId: bedRefs[0].id,
      updatedAt: Date.now(),
    },
    {
      name: "John Doe",
      age: 68,
      gender: "Male",
      diagnosis: "Cardiac observation",
      status: "stable",
      doctor: "Dr. Lee",
      admissionDate: new Date().toISOString(),
      contact: "555-2000",
      notes: "",
      bedId: bedRefs[1].id,
      updatedAt: Date.now(),
    },
  ];

  const patientRefs = await Promise.all(
    patients.map((p) => adminDb.collection("patients").add(p))
  );

  await bedRefs[0].update({ patientId: patientRefs[0].id, status: "occupied" });
  await bedRefs[1].update({ patientId: patientRefs[1].id, status: "occupied" });

  await adminDb.collection("notifications").add({
    type: "admission",
    message: "Seed patients added",
    isRead: false,
    createdAt: Date.now(),
  });

  console.log("Seed data created");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
