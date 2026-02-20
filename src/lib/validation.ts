import { z } from "zod";
import { BedStatus, PatientStatus, NotificationType } from "../types";

export const bedStatusValues: BedStatus[] = [
  "available",
  "occupied",
  "cleaning",
  "maintenance",
];

export const patientStatusValues: PatientStatus[] = [
  "stable",
  "critical",
  "recovering",
  "discharged",
];

export const notificationTypes: NotificationType[] = [
  "admission",
  "bed_occupied",
  "bed_vacated",
  "critical",
  "doc_uploaded",
  "upcoming_discharge",
];

export const bedSchema = z.object({
  bedNumber: z.string().min(1),
  wardId: z.string().min(1),
  room: z.string().min(1),
  status: z.enum(bedStatusValues),
  posX: z.number().default(0),
  posY: z.number().default(0),
  patientId: z.string().optional().nullable(),
});

export const bedPositionSchema = z.object({
  posX: z.number(),
  posY: z.number(),
});

export const patientSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
  gender: z.string().min(1),
  diagnosis: z.string().min(1),
  status: z.enum(patientStatusValues),
  doctor: z.string().min(1),
  admissionDate: z.string().min(1),
  contact: z.string().min(1),
  notes: z.string().optional(),
  bedId: z.string().optional().nullable(),
});

export const wardSchema = z.object({
  name: z.string().min(1),
  floor: z.string().optional(),
  description: z.string().optional(),
});

export const notificationSchema = z.object({
  type: z.enum(notificationTypes),
  message: z.string(),
  isRead: z.boolean().default(false),
});

export const documentMetadataSchema = z.object({
  patientId: z.string().min(1),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().min(1),
  storagePath: z.string().min(1),
  fileUrl: z.string().url(),
});
