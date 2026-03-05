import { BedStatus, PatientStatus } from '../types';

export const bedStatusMeta: Record<BedStatus, { label: string; color: string; bg: string }> = {
    available:   { label: 'Available',   color: 'text-status-available', bg: 'bg-status-available' },
    occupied:    { label: 'Occupied',    color: 'text-status-occupied', bg: 'bg-status-occupied' },
    cleaning:    { label: 'Cleaning',    color: 'text-status-cleaning', bg: 'bg-status-cleaning' },
    maintenance: { label: 'Maintenance', color: 'text-status-maintenance', bg: 'bg-status-maintenance' },
};

export const patientStatusMeta: Record<PatientStatus, { label: string; color: string; bg: string }> = {
    referral: { label: 'Referral', color: 'text-patient-stable', bg: 'bg-patient-stable' },
    walk_in:  { label: 'Walk-In',  color: 'text-patient-recovering', bg: 'bg-patient-recovering' },
};
