export type BedStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export type PatientStatus = 'referral' | 'walk_in';

export type ServiceAccess = 'wc_health' | 'other_agency' | 'no';

export type PastYearCount = '0' | '1_3' | '4_10' | '10_plus';

export type YesNoNA = 'yes' | 'no' | 'na';

export type ArrestCount = '0' | '1_2' | '3_4' | '5_plus';

export type DaysRange = '0' | '1_7' | '8_14' | '14_plus';

export type NotificationType =
    | 'admission'
    | 'bed_occupied'
    | 'bed_vacated'
    | 'critical'
    | 'doc_uploaded'
    | 'upcoming_discharge';

export interface Facility {
    id: number;
    name: string;
    notes?: string | null;
    rooms?: Room[];
    created_at: string;
    updated_at: string;
}

export interface Room {
    id: number;
    name: string;
    notes?: string | null;
    facility_id: number;
    facility?: Facility;
    beds?: Bed[];
    created_at: string;
    updated_at: string;
}

export interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    dob: string;
    status: PatientStatus;
    referral_from?: string | null;
    insurance?: string | null;
    intake_date: string;
    discharge_date?: string | null;
    discharged_at?: string | null;
    bed_id?: number | null;
    discharged_bed_id?: number | null;

    // Admission questionnaire
    psych_services_access?: ServiceAccess | null;
    therapy_services_access?: ServiceAccess | null;
    pcp_services_access?: ServiceAccess | null;
    medications_access?: ServiceAccess | null;
    er_visits_past_year?: PastYearCount | null;
    inpatient_stays_past_year?: PastYearCount | null;
    dependable_transportation?: boolean | null;
    stable_housing?: boolean | null;
    homelessness_days_past_year?: PastYearCount | null;
    vital_documents_access?: boolean | null;
    phone_access?: boolean | null;
    employed_or_income?: boolean | null;
    support_system?: boolean | null;
    is_veteran?: boolean | null;
    veteran_connected_services?: YesNoNA | null;
    seeking_mat_services?: boolean | null;
    enrolled_mat_services?: boolean | null;
    arrests_past_12_months?: ArrestCount | null;
    arrests_lifetime?: ArrestCount | null;
    jail_days_past_12_months?: DaysRange | null;
    jail_days_lifetime?: DaysRange | null;
    prison_time_past_12_months?: DaysRange | null;
    prison_time_lifetime?: DaysRange | null;
    created_at: string;
    updated_at: string;
    bed?: Bed;
    discharged_bed?: Bed;
}

export interface Bed {
    id: number;
    bed_number: string;
    bed_type: 'single' | 'ada_single' | 'double_top' | 'double_bottom';
    room_id: number;
    room?: Room;
    status: BedStatus;
    patients?: Patient[];
    created_at: string;
    updated_at: string;
}

export interface Document {
    id: number;
    patient_id: number | null;
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
