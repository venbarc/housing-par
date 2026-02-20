export type BedStatus = "available" | "occupied" | "cleaning" | "maintenance";

export type PatientStatus = "stable" | "critical" | "recovering" | "discharged";

export type NotificationType =
  | "admission"
  | "bed_occupied"
  | "bed_vacated"
  | "critical"
  | "doc_uploaded"
  | "upcoming_discharge";

export interface Bed {
  id: string;
  bedNumber: string;
  wardId: string;
  room: string;
  status: BedStatus;
  posX: number;
  posY: number;
  patientId?: string | null;
  updatedAt: number;
}

export interface Ward {
  id: string;
  name: string;
  floor?: string;
  description?: string;
}

export interface Patient {
  id: string;
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
  updatedAt: number;
}

export interface DocumentRecord {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  fileUrl: string;
  uploadedAt: number;
}

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: number;
}
