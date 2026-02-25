import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bed, Document, Patient, Ward } from '../../types';
import { bedStatusMeta, patientStatusMeta } from '../../lib/status';

interface Props {
    bed: Bed | null;
    ward?: Ward;
    patient?: Patient;
    wards: Ward[];
    documents: Document[];
    onClose: () => void;
}

export default function BedDetailModal({ bed, ward, patient, wards, documents, onClose }: Props) {
    const [form, setForm] = useState(() => ({
        bed_number: bed?.bed_number ?? '',
        room: bed?.room ?? '',
        status: bed?.status ?? 'available',
        ward_id: bed?.ward_id ?? (wards[0]?.id ?? ''),
    }));
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (!bed) return null;

    const bedStatus = bedStatusMeta[bed.status];
    const patientStatus = patient ? patientStatusMeta[patient.status] : null;

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
        if (patient) {
            toast.error('Cannot delete a bed with an assigned patient.');
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

    const onDeleteDoc = (id: number) => {
        router.delete(`/documents/${id}`, {
            preserveScroll: true,
            onError: () => toast.error('Delete failed'),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" className="modal-backdrop" onClick={onClose} />
            <section className="card modal-panel relative z-10 w-full max-w-3xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-extrabold">Bed {bed.bed_number}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
                            Ward {ward?.name ?? bed.ward_id} · Room {bed.room}
                        </p>
                        <span className={`badge mt-2 border-transparent ${bedStatus.bg} ${bedStatus.color}`}>{bedStatus.label}</span>
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
                                <label className="field-label">Room</label>
                                <input
                                    className="form-input"
                                    value={form.room}
                                    onChange={(e) => setForm((v) => ({ ...v, room: e.target.value }))}
                                    required
                                />
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
                            <div>
                                <label className="field-label">Ward / Floor</label>
                                <select
                                    className="form-select"
                                    value={form.ward_id}
                                    onChange={(e) => setForm((v) => ({ ...v, ward_id: Number(e.target.value) }))}
                                >
                                    {wards.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name} {w.floor ? `(Floor ${w.floor})` : ''}
                                        </option>
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
                                disabled={deleting}
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

                        {patient ? (
                            <div className="surface-subtle p-3 rounded-xl space-y-2">
                                <h4 className="text-sm font-semibold text-[color:var(--text-strong)]">Patient</h4>
                                <p className="text-sm font-bold text-[color:var(--text-strong)]">{patient.name}</p>
                                <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <span className="badge">{patient.age} yrs</span>
                                    <span className="badge">{patient.gender}</span>
                                </div>
                                {patientStatus && (
                                    <span className={`badge border-transparent ${patientStatus.bg} ${patientStatus.color}`}>
                                        {patientStatus.label}
                                    </span>
                                )}
                                <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{patient.diagnosis}</p>
                            </div>
                        ) : (
                            <div className="surface-subtle p-3 rounded-xl">
                                <h4 className="text-sm font-semibold text-[color:var(--text-strong)]">Patient</h4>
                                <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>No patient assigned.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
