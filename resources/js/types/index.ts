export type BedStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export type PatientStatus = 'stable' | 'critical' | 'recovering' | 'discharged';

export type NotificationType =
    | 'admission'
    | 'bed_occupied'
    | 'bed_vacated'
    | 'critical'
    | 'doc_uploaded'
    | 'upcoming_discharge';

export interface Ward {
    id: number;
    name: string;
    floor?: string | null;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Patient {
    id: number;
    name: string;
    age: number;
    gender: string;
    diagnosis: string;
    status: PatientStatus;
    doctor: string;
    admission_date: string;
    contact: string;
    notes?: string | null;
    bed_id?: number | null;
    created_at: string;
    updated_at: string;
}

export interface Bed {
    id: number;
    bed_number: string;
    ward_id: number;
    room: string;
    status: BedStatus;
    pos_x: number;
    pos_y: number;
    patient_id?: number | null;
    patient?: Patient | null;
    created_at: string;
    updated_at: string;
}

export interface Document {
    id: number;
    patient_id: number;
    bed_id?: number | null;
    file_name: string;
    file_type: string;
    file_size: number;
    storage_path: string;
    file_url: string;
    uploaded_at: string;
}

export interface Notification {
    id: number;
    type: NotificationType;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
}

export interface PageProps {
    auth: {
        user: User | null;
        unread_notifications: number;
    };
    flash?: {
        message?: string | null;
        error?: string | null;
    };
    [key: string]: unknown;
}
