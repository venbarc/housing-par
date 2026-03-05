import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ArrestCount, Bed, DaysRange, Document, PastYearCount, Room, ServiceAccess, YesNoNA } from '../../types';
import { bedStatusMeta, patientStatusMeta } from '../../lib/status';

interface Props {
    bed: Bed | null;
    room?: Room;
    rooms: Room[];
    documents: Document[];
    onClose: () => void;
}

function yesNo(value: boolean | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return value ? 'Yes' : 'No';
}

function serviceAccessLabel(value: ServiceAccess | null | undefined): string {
    if (!value) return '-';
    if (value === 'wc_health') return 'With WC Health';
    if (value === 'other_agency') return 'Yes - Other Agency';
    return 'No';
}

function pastYearCountLabel(value: PastYearCount | null | undefined): string {
    if (value === null || value === undefined) return '-';
    if (value === '0') return '0';
    if (value === '1_3') return '1–3';
    if (value === '4_10') return '4–10';
    return '10+';
}

function yesNoNaLabel(value: YesNoNA | null | undefined): string {
    if (!value) return '-';
    if (value === 'yes') return 'Yes';
    if (value === 'no') return 'No';
    return 'N/A';
}

function arrestCountLabel(value: ArrestCount | null | undefined): string {
    if (value === null || value === undefined) return '-';
    if (value === '0') return '0';
    if (value === '1_2') return '1–2';
    if (value === '3_4') return '3–4';
    return '5+';
}

function daysRangeLabel(value: DaysRange | null | undefined): string {
    if (value === null || value === undefined) return '-';
    if (value === '0') return '0';
    if (value === '1_7') return '1–7';
    if (value === '8_14') return '8–14';
    return '14+';
}

export default function BedDetailModal({ bed, room, rooms, documents, onClose }: Props) {
    const [form, setForm] = useState(() => ({
        bed_number: bed?.bed_number ?? '',
        status: bed?.status ?? 'available',
        room_id: bed?.room_id ?? (rooms[0]?.id ?? ''),
        bed_type: bed?.bed_type ?? 'single',
    }));
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (!bed) return null;

    const bedStatus = bedStatusMeta[bed.status];
    const bedPatients = bed.patients ?? [];
    const hasPatients = bedPatients.length > 0;

    const onSave = async (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        router.patch(`/beds/${bed.id}`, form, {
            preserveScroll: true,
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Update failed')),
            onFinish: () => setBusy(false),
        });
    };

    const onUpload = (event: FormEvent) => {
        event.preventDefault();
        if (!file) {
            toast.error('Choose a document');
            return;
        }
        const payload: Record<string, any> = { bed_id: bed.id, file };
        router.post('/documents', payload, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Upload failed')),
            onSuccess: () => setFile(null),
        });
    };

    const onDeleteBed = () => {
        if (hasPatients) {
            toast.error('Cannot delete a bed with assigned patients.');
            return;
        }
        setDeleting(true);
        router.delete(`/beds/${bed.id}`, {
            preserveScroll: true,
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Delete failed')),
            onFinish: () => {
                setDeleting(false);
                onClose();
            },
        });
    };

    const onDischargePatient = (patientId: number) => {
        router.post(`/beds/${bed.id}/discharge`, { patient_id: patientId }, {
            preserveScroll: true,
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Discharge failed')),
        });
    };

    const onDeleteDoc = (id: number) => {
        router.delete(`/documents/${id}`, {
            preserveScroll: true,
            onError: () => toast.error('Delete failed'),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" className="modal-backdrop" onClick={onClose} />
            <section className="card modal-panel relative z-10 w-full max-w-5xl max-h-[85vh] overflow-y-auto p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-extrabold">Bed {bed.bed_number}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
                            {room?.name ?? 'No room'}
                            {room?.facility ? ` · ${room.facility.name}` : ''}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`badge border-transparent ${bedStatus.bg} ${bedStatus.color}`}>{bedStatus.label}</span>
                            <span className="badge border-transparent bg-slate-100 text-slate-700">
                                {bed.bed_type === 'single'
                                    ? 'Single'
                                    : bed.bed_type === 'ada_single'
                                        ? 'ADA Single'
                                        : bed.bed_type === 'double_top'
                                            ? 'Double - Top'
                                            : 'Double - Bottom'}
                            </span>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="btn-secondary p-2" aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <form onSubmit={onSave} className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="field-label">Bed number</label>
                                <input
                                    className="form-input"
                                    value={form.bed_number}
                                    onChange={(e) => setForm((v) => ({ ...v, bed_number: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="field-label">Bed type</label>
                                <select
                                    className="form-select"
                                    value={form.bed_type ?? bed.bed_type}
                                    onChange={(e) => setForm((v) => ({ ...v, bed_type: e.target.value as Bed['bed_type'] }))}
                                >
                                    <option value="single">Single</option>
                                    <option value="ada_single">ADA Single</option>
                                    <option value="double_top">Double - Top</option>
                                    <option value="double_bottom">Double - Bottom</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Status</label>
                                <select
                                    className="form-select"
                                    value={form.status}
                                    onChange={(e) => setForm((v) => ({ ...v, status: e.target.value as Bed['status'] }))}
                                >
                                    {(['available', 'occupied', 'cleaning', 'maintenance'] as const).map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="field-label">Room</label>
                                <select
                                    className="form-select"
                                    value={form.room_id}
                                    onChange={(e) => setForm((v) => ({ ...v, room_id: Number(e.target.value) }))}
                                >
                                    {rooms.map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="btn-primary" disabled={busy}>
                                {busy ? 'Saving...' : 'Save changes'}
                            </button>
                            <button
                                type="button"
                                className="btn-secondary text-red-600 border-red-200"
                                onClick={onDeleteBed}
                                disabled={deleting || hasPatients}
                            >
                                {deleting ? 'Deleting...' : 'Delete bed'}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-3">
                        <div className="surface-subtle p-3 rounded-xl">
                            <h4 className="text-sm font-semibold text-slate-800">Attachments</h4>
                            <div className="space-y-2 mt-2">
                                {documents.length === 0 && <p className="text-sm text-slate-500">No documents yet.</p>}
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-semibold text-slate-800">{doc.file_name}</p>
                                            <p className="text-xs text-slate-500">{Math.round(doc.file_size / 1024)} KB</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn-link text-xs">Download</a>
                                            <button type="button" onClick={() => onDeleteDoc(doc.id)} className="text-xs text-red-600 hover:underline">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={onUpload} className="mt-3 space-y-2">
                                <input
                                    type="file"
                                    accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                                    className="form-input"
                                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                />
                                <button type="submit" className="btn-secondary w-full">Upload</button>
                            </form>
                        </div>

                        <div className="surface-subtle p-3 rounded-xl space-y-2">
                            <h4 className="text-sm font-semibold text-[color:var(--text-strong)]">
                                Patients ({bedPatients.length}/1)
                            </h4>
                            {bedPatients.length > 0 ? (
                                bedPatients.map((patient) => {
                                    const ps = patientStatusMeta[patient.status];
                                    return (
                                        <div key={patient.id} className="flex items-start justify-between gap-2 border-b border-[color:var(--border-soft)] pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="text-sm font-bold text-[color:var(--text-strong)]">
                                                    {patient.first_name} {patient.last_name}
                                                </p>
                                                {ps && (
                                                    <span className={`badge mt-1 border-transparent ${ps.bg} ${ps.color}`}>
                                                        {ps.label}
                                                    </span>
                                                )}
                                                <div className="mt-2 space-y-1 text-xs" style={{ color: 'var(--text-subtle)' }}>
                                                    <p>DOB: {patient.dob ?? '-'}</p>
                                                    <p>Referral From: {patient.referral_from ?? '-'}</p>
                                                    <p>Insurance: {patient.insurance ?? '-'}</p>
                                                    <p>Intake Date: {patient.intake_date ?? '-'}</p>
                                                    <p>Discharge Date: {patient.discharge_date ?? '-'}</p>
                                                </div>

                                                <div className="mt-3 rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-3">
                                                    <h5 className="text-xs font-semibold text-[color:var(--text-strong)]">Admission Questionnaire</h5>
                                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs" style={{ color: 'var(--text-subtle)' }}>
                                                        <p>Psych services access: {serviceAccessLabel(patient.psych_services_access)}</p>
                                                        <p>Therapy services access: {serviceAccessLabel(patient.therapy_services_access)}</p>
                                                        <p>PCP services access: {serviceAccessLabel(patient.pcp_services_access)}</p>
                                                        <p>Medications access: {serviceAccessLabel(patient.medications_access)}</p>
                                                        <p>ER stays (past year): {pastYearCountLabel(patient.er_visits_past_year)}</p>
                                                        <p>Inpatient stays (past year): {pastYearCountLabel(patient.inpatient_stays_past_year)}</p>
                                                        <p>Dependable transportation: {yesNo(patient.dependable_transportation)}</p>
                                                        <p>Stable housing: {yesNo(patient.stable_housing)}</p>
                                                        <p>Homelessness days (past year): {pastYearCountLabel(patient.homelessness_days_past_year)}</p>
                                                        <p>Vital ID documents access: {yesNo(patient.vital_documents_access)}</p>
                                                        <p>Phone access: {yesNo(patient.phone_access)}</p>
                                                        <p>Employed / income: {yesNo(patient.employed_or_income)}</p>
                                                        <p>Support system: {yesNo(patient.support_system)}</p>
                                                        <p>Veteran: {yesNo(patient.is_veteran)}</p>
                                                        <p>Veteran services connected: {yesNoNaLabel(patient.veteran_connected_services)}</p>
                                                        <p>Seeking MAT services: {yesNo(patient.seeking_mat_services)}</p>
                                                        <p>Enrolled in MAT services: {yesNo(patient.enrolled_mat_services)}</p>
                                                        <p>Arrests (past 12 months): {arrestCountLabel(patient.arrests_past_12_months)}</p>
                                                        <p>Arrests (lifetime): {arrestCountLabel(patient.arrests_lifetime)}</p>
                                                        <p>Jail days (past 12 months): {daysRangeLabel(patient.jail_days_past_12_months)}</p>
                                                        <p>Jail days (lifetime): {daysRangeLabel(patient.jail_days_lifetime)}</p>
                                                        <p>Prison time (past 12 months): {daysRangeLabel(patient.prison_time_past_12_months)}</p>
                                                        <p>Prison time (lifetime): {daysRangeLabel(patient.prison_time_lifetime)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-secondary px-2 py-1 text-xs text-red-600 border-red-200"
                                                onClick={() => onDischargePatient(patient.id)}
                                            >
                                                Discharge
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>No patient assigned.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
