import { Link, router } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { Bed, Patient } from '../../types';

interface Props {
    open: boolean;
    bed: Bed | null;
    patients: Patient[];
    onClose: () => void;
}

export default function BedAllocateModal({ open, bed, patients, onClose }: Props) {
    const [patientId, setPatientId] = useState<number | ''>('');

    useEffect(() => {
        if (!open) return;
        setPatientId('');
    }, [open, bed?.id]);

    const eligiblePatients = useMemo(
        () => patients.filter((p) => !p.bed_id && !p.discharged_at),
        [patients]
    );

    if (!open || !bed) return null;

    const hasOccupant = (bed.patients?.length ?? 0) > 0;
    const disabled = bed.status === 'maintenance' || hasOccupant;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (disabled) return;

        if (!patientId) {
            toast.error('Select a patient to allocate.');
            return;
        }

        router.patch(
            `/patients/${patientId}`,
            { bed_id: bed.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Allocated');
                    onClose();
                },
                onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not allocate.')),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" className="modal-backdrop" onClick={onClose} />
            <section className="card modal-panel relative z-10 w-full max-w-xl p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-extrabold">Allocate Bed</h3>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-subtle)' }}>
                            {bed.room?.name ?? 'Room'} • Bed {bed.bed_number}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="btn-secondary p-2" aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {disabled ? (
                    <div className="rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 text-sm text-[color:var(--text-muted)]">
                        This bed is not available for allocation.
                    </div>
                ) : eligiblePatients.length === 0 ? (
                    <div className="rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 text-sm text-[color:var(--text-muted)]">
                        No unassigned patients found. Create a patient first in{' '}
                        <Link href="/patients" className="btn-link">
                            Patients
                        </Link>
                        .
                    </div>
                ) : (
                    <form onSubmit={submit}>
                        <div>
                            <label className="field-label">Patient</label>
                            <select
                                className="form-select"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value ? Number(e.target.value) : '')}
                                required
                            >
                                <option value="">Select a patient</option>
                                {eligiblePatients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.last_name}, {p.first_name} ({p.status})
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-[color:var(--text-subtle)]">
                                Only patients already registered (and not currently assigned to a bed) can be allocated.
                            </p>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={!patientId}>
                                Allocate
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}

