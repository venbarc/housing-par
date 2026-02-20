"use client";

import { useState } from "react";
import { api, withToast } from "../../lib/client-api";
import { Bed, Patient } from "../../types";
import { bedStatusValues, patientStatusValues } from "../../lib/validation";
import toast from "react-hot-toast";

type Props = {
  beds: Bed[];
  patients: Patient[];
};

export default function QuickActions({ beds, patients }: Props) {
  const [bedNumber, setBedNumber] = useState("");
  const [room, setRoom] = useState("");
  const [wardId, setWardId] = useState("A");
  const [status, setStatus] = useState<Bed["status"]>("available");

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState(50);
  const [patientDiagnosis, setPatientDiagnosis] = useState("General");
  const [patientStatus, setPatientStatus] = useState<Patient["status"]>("stable");
  const [patientDoctor, setPatientDoctor] = useState("Dr. Adams");
  const [patientContact, setPatientContact] = useState("555-1234");
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [patientNotes, setPatientNotes] = useState("");

  const [assignBedId, setAssignBedId] = useState("");
  const [assignPatientId, setAssignPatientId] = useState("");

  const [uploadPatientId, setUploadPatientId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const onCreateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    await withToast(
      api.createBed({ bedNumber, wardId, room, status }),
      "Bed created"
    );
    setBedNumber("");
    setRoom("");
  };

  const onCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    await withToast(
      api.createPatient({
        name: patientName,
        age: patientAge,
        gender: "N/A",
        diagnosis: patientDiagnosis,
        status: patientStatus,
        doctor: patientDoctor,
        admissionDate,
        contact: patientContact,
        notes: patientNotes,
      }),
      "Patient created"
    );
    setPatientName("");
    setPatientNotes("");
  };

  const onAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignBedId || !assignPatientId) {
      toast.error("Select a bed and patient");
      return;
    }
    await withToast(api.assignPatient(assignBedId, assignPatientId), "Patient assigned");
  };

  const onDischarge = async (bedId: string) => {
    await withToast(api.dischargePatient(bedId), "Patient discharged");
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPatientId || !file) {
      toast.error("Select patient and file");
      return;
    }
    await withToast(api.uploadDocument(uploadPatientId, file), "Document uploaded");
    setFile(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <form onSubmit={onCreateBed} className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-800">Create Bed</p>
          <span className="text-xs text-slate-500">Bed CRUD</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="form-input"
            placeholder="Bed number"
            value={bedNumber}
            onChange={(e) => setBedNumber(e.target.value)}
            required
          />
          <input
            className="form-input"
            placeholder="Ward"
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
            required
          />
          <input
            className="form-input"
            placeholder="Room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
          />
          <select
            className="form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value as Bed["status"])}
          >
            {bedStatusValues.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-full" type="submit">
          Save bed
        </button>
      </form>

      <form onSubmit={onCreatePatient} className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-800">Create Patient</p>
          <span className="text-xs text-slate-500">Patient CRUD</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="form-input"
            placeholder="Full name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="number"
            placeholder="Age"
            value={patientAge}
            onChange={(e) => setPatientAge(Number(e.target.value))}
            required
          />
          <input
            className="form-input"
            placeholder="Diagnosis"
            value={patientDiagnosis}
            onChange={(e) => setPatientDiagnosis(e.target.value)}
            required
          />
          <select
            className="form-input"
            value={patientStatus}
            onChange={(e) => setPatientStatus(e.target.value as Patient["status"])}
          >
            {patientStatusValues.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            className="form-input"
            placeholder="Doctor"
            value={patientDoctor}
            onChange={(e) => setPatientDoctor(e.target.value)}
            required
          />
          <input
            className="form-input"
            placeholder="Contact"
            value={patientContact}
            onChange={(e) => setPatientContact(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="date"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
          />
          <input
            className="form-input"
            placeholder="Notes"
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
          />
        </div>
        <button className="btn-primary w-full" type="submit">
          Save patient
        </button>
      </form>

      <form onSubmit={onAssign} className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-800">Assign Patient to Bed</p>
          <span className="text-xs text-slate-500">Assignment</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            className="form-input"
            value={assignBedId}
            onChange={(e) => setAssignBedId(e.target.value)}
            required
          >
            <option value="">Select bed</option>
            {beds.map((b) => (
              <option key={b.id} value={b.id}>
                Bed {b.bedNumber} ({b.status})
              </option>
            ))}
          </select>
          <select
            className="form-input"
            value={assignPatientId}
            onChange={(e) => setAssignPatientId(e.target.value)}
            required
          >
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary w-full" type="submit">
            Assign
          </button>
          {assignBedId && (
            <button
              type="button"
              onClick={() => onDischarge(assignBedId)}
              className="btn-ghost w-full"
            >
              Discharge
            </button>
          )}
        </div>
      </form>

      <form onSubmit={onUpload} className="card p-4 space-y-3" id="documents">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-800">Upload Document</p>
          <span className="text-xs text-slate-500">Document CRUD</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            className="form-input"
            value={uploadPatientId}
            onChange={(e) => setUploadPatientId(e.target.value)}
            required
          >
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            className="form-input"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        <button className="btn-primary w-full" type="submit">
          Upload
        </button>
      </form>
    </div>
  );
}
