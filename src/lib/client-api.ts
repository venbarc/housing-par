"use client";

import toast from "react-hot-toast";
import { BedStatus, PatientStatus } from "../types";

async function request<T>(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  assignPatient: (bedId: string, patientId: string) =>
    request(`/api/beds/${bedId}/assign`, {
      method: "POST",
      body: JSON.stringify({ patientId }),
    }),
  dischargePatient: (bedId: string) =>
    request(`/api/beds/${bedId}/discharge`, { method: "POST" }),
  updateBedStatus: (bedId: string, status: BedStatus) =>
    request(`/api/beds/${bedId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  moveBed: (bedId: string, pos: { posX: number; posY: number }) =>
    request(`/api/beds/${bedId}/position`, {
      method: "PATCH",
      body: JSON.stringify(pos),
    }),
  createBed: (payload: {
    bedNumber: string;
    wardId: string;
    room: string;
    status: BedStatus;
  }) => request("/api/beds", { method: "POST", body: JSON.stringify(payload) }),
  createPatient: (payload: {
    name: string;
    age: number;
    gender: string;
    diagnosis: string;
    status: PatientStatus;
    doctor: string;
    admissionDate: string;
    contact: string;
    notes?: string;
    bedId?: string | null;
  }) => request("/api/patients", { method: "POST", body: JSON.stringify(payload) }),
  uploadDocument: async (patientId: string, file: File) => {
    const form = new FormData();
    form.append("patientId", patientId);
    form.append("file", file);
    const res = await fetch("/api/uploads/patient-doc", { method: "POST", body: form });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || res.statusText);
    }
    return res.json();
  },
};

export function withToast<T>(promise: Promise<T>, message: string) {
  return toast.promise(promise, {
    loading: "Working...",
    success: message,
    error: (err) => err.message || "Something went wrong",
  });
}
