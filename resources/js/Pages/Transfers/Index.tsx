import { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import AppShell from '../../components/layout/AppShell';
import { Bed, PageProps, PatientTransfer } from '../../types';

interface Props extends PageProps {
    transfers: PatientTransfer[];
    available_beds: Bed[];
}

type AcceptForm = {
    intake_date: string;
    room_id: number | '';
    bed_id: number | '';
};

function formatDateTime(value?: string | null): string {
    if (!value) return '-';
    try {
        return format(new Date(value), 'MM/dd/yyyy hh:mm a');
    } catch {
        return value;
    }
}

export default function TransfersIndex({ transfers, available_beds }: Props) {
    const [forms, setForms] = useState<Record<number, AcceptForm>>({});

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['transfers', 'available_beds'] });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const getForm = (transferId: number): AcceptForm => {
        return forms[transferId] ?? { intake_date: today, room_id: '', bed_id: '' };
    };

    const setForm = (transferId: number, patch: Partial<AcceptForm>) => {
        setForms((prev) => {
            const current = prev[transferId] ?? { intake_date: today, room_id: '', bed_id: '' };
            return { ...prev, [transferId]: { ...current, ...patch } };
        });
    };

    const accept = (transfer: PatientTransfer) => {
        const form = getForm(transfer.id);
        if (!form.intake_date || !form.room_id || !form.bed_id) {
            toast.error('Intake date, destination room, and destination bed are required.');
            return;
        }

        router.post(
            `/transfers/${transfer.id}/accept`,
            { intake_date: form.intake_date, bed_id: form.bed_id },
            {
                preserveScroll: true,
                onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not accept transfer.')),
                onSuccess: () => toast.success('Transfer accepted.'),
            }
        );
    };

    const reject = (transfer: PatientTransfer) => {
        router.post(
            `/transfers/${transfer.id}/reject`,
            {},
            {
                preserveScroll: true,
                onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not reject transfer.')),
                onSuccess: () => toast.success('Transfer rejected.'),
            }
        );
    };

    return (
        <>
            <Head title="Transfers" />
            <AppShell title="Transfers" description="Pending move requests waiting for destination acceptance">
                <section className="card p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Pending Transfers</h3>
                            <p className="text-sm text-[var(--text-subtle)]">Accept or reject destination move requests</p>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                            {transfers.length} pending
                        </span>
                    </div>

                    {transfers.length === 0 ? (
                        <p className="rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 text-sm text-[var(--text-subtle)]">
                            No pending transfer requests.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {transfers.map((transfer) => {
                                const form = getForm(transfer.id);
                                const destinationBeds = available_beds.filter(
                                    (bed) =>
                                        Number(bed.room?.facility_id) === Number(transfer.destination_facility_id) &&
                                        (bed.patients?.length ?? 0) === 0
                                );
                                const destinationRooms = destinationBeds.reduce<Record<number, string>>((acc, bed) => {
                                    if (!bed.room_id) return acc;
                                    if (!acc[bed.room_id]) {
                                        acc[bed.room_id] = bed.room?.name ?? `Room #${bed.room_id}`;
                                    }
                                    return acc;
                                }, {});
                                const bedsForSelectedRoom = destinationBeds.filter(
                                    (bed) => form.room_id !== '' && bed.room_id === Number(form.room_id)
                                );

                                return (
                                    <article key={transfer.id} className="rounded-xl border border-[color:var(--border-soft)] p-4">
                                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                                            <div className="space-y-1 text-sm">
                                                <p className="font-semibold text-[var(--text-strong)]">
                                                    {transfer.source_patient?.first_name} {transfer.source_patient?.last_name}
                                                </p>
                                                <p className="text-[var(--text-subtle)]">Requested: {formatDateTime(transfer.requested_at)}</p>
                                                <p className="text-[var(--text-subtle)]">
                                                    Source: {transfer.source_facility?.name ?? '-'} / {transfer.source_program?.name ?? '-'}
                                                </p>
                                                <p className="text-[var(--text-subtle)]">
                                                    Destination: {transfer.destination_facility?.name ?? '-'} / {transfer.destination_program?.name ?? '-'}
                                                </p>
                                            </div>

                                            <div className="space-y-1 text-sm">
                                                <p className="text-[var(--text-subtle)]">
                                                    Disposition: {transfer.source_patient?.discharge_disposition ?? '-'}
                                                </p>
                                                <p className="text-[var(--text-subtle)]">
                                                    Destination Option: {transfer.source_patient?.discharge_destination ?? '-'}
                                                </p>
                                                <p className="text-[var(--text-subtle)]">Leave Details:</p>
                                                <p className="rounded-lg bg-[color:var(--surface-soft)] p-2 text-[var(--text-strong)]">
                                                    {transfer.source_patient?.leave_details ?? '-'}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <label className="field-label">New Intake Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-input"
                                                        value={form.intake_date}
                                                        onChange={(e) => setForm(transfer.id, { intake_date: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="field-label">Destination Room</label>
                                                    <select
                                                        className="form-select"
                                                        value={form.room_id}
                                                        onChange={(e) =>
                                                            setForm(transfer.id, {
                                                                room_id: e.target.value ? Number(e.target.value) : '',
                                                                bed_id: '',
                                                            })
                                                        }
                                                    >
                                                        <option value="">Select destination room</option>
                                                        {Object.entries(destinationRooms).map(([roomId, roomName]) => (
                                                            <option key={roomId} value={Number(roomId)}>
                                                                {roomName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="field-label">Destination Bed</label>
                                                    <select
                                                        className="form-select"
                                                        value={form.bed_id}
                                                        disabled={form.room_id === ''}
                                                        onChange={(e) =>
                                                            setForm(transfer.id, {
                                                                bed_id: e.target.value ? Number(e.target.value) : '',
                                                            })
                                                        }
                                                    >
                                                        <option value="">
                                                            {form.room_id === '' ? 'Select destination room first' : 'Select destination bed'}
                                                        </option>
                                                        {bedsForSelectedRoom.map((bed) => (
                                                            <option key={bed.id} value={bed.id}>
                                                                Bed {bed.bed_number}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn-secondary text-red-600 border-red-200"
                                                        onClick={() => reject(transfer)}
                                                    >
                                                        Reject
                                                    </button>
                                                    <button type="button" className="btn-primary" onClick={() => accept(transfer)}>
                                                        Accept
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </AppShell>
        </>
    );
}
