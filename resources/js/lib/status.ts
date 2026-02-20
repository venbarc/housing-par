import { BedStatus, PatientStatus } from '../types';

export const bedStatusMeta: Record<BedStatus, { label: string; color: string; bg: string }> = {
    available:   { label: 'Available',   color: 'text-green-700',   bg: 'bg-green-100' },
    occupied:    { label: 'Occupied',    color: 'text-blue-700',    bg: 'bg-blue-100' },
    cleaning:    { label: 'Cleaning',    color: 'text-amber-700',   bg: 'bg-amber-100' },
    maintenance: { label: 'Maintenance', color: 'text-red-700',     bg: 'bg-red-100' },
};

export const patientStatusMeta: Record<PatientStatus, { label: string; color: string; bg: string }> = {
    stable:     { label: 'Stable',     color: 'text-emerald-700', bg: 'bg-emerald-100' },
    critical:   { label: 'Critical',   color: 'text-red-700',     bg: 'bg-red-100' },
    recovering: { label: 'Recovering', color: 'text-blue-700',    bg: 'bg-blue-100' },
    discharged: { label: 'Discharged', color: 'text-slate-600',   bg: 'bg-slate-100' },
};
