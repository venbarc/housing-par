import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bed, DischargeOptionsMap, Facility, Patient, Program, TransferPair } from '../../types';

interface Props {
    open: boolean;
    bed: Bed | null;
    patient: Patient | null;
    dischargeOptions: DischargeOptionsMap;
    facilities: Facility[];
    programs: Program[];
    transferPairs: TransferPair[];
    onClose: () => void;
}

export default function DischargeModal({
    open,
    bed,
    patient,
    dischargeOptions,
    facilities,
    programs,
    transferPairs,
    onClose,
}: Props) {
    const dispositions = useMemo(() => Object.keys(dischargeOptions), [dischargeOptions]);
    const defaultDisposition = dispositions[0] ?? '';
    const defaultDestination = dischargeOptions[defaultDisposition]?.[0] ?? '';

    const form = useForm({
        patient_id: patient?.id ?? null,
        discharge_disposition: defaultDisposition,
        discharge_destination: defaultDestination,
        leave_details: '',
        is_move: false,
        destination_facility_id: '' as '' | number,
        destination_program_id: '' as '' | number,
    });

    useEffect(() => {
        if (!open) return;
        const firstDisposition = dispositions[0] ?? '';
        form.setData({
            patient_id: patient?.id ?? null,
            discharge_disposition: firstDisposition,
            discharge_destination: dischargeOptions[firstDisposition]?.[0] ?? '',
            leave_details: '',
            is_move: false,
            destination_facility_id: '',
            destination_program_id: '',
        });
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, patient?.id, bed?.id, defaultDisposition]);

    const destinationOptions = useMemo(
        () => dischargeOptions[form.data.discharge_disposition] ?? [],
        [dischargeOptions, form.data.discharge_disposition]
    );

    const validDestinationPrograms = useMemo(() => {
        if (!form.data.destination_facility_id) return [];
        const allowed = new Set(
            transferPairs
                .filter((pair) => pair.facility_id === Number(form.data.destination_facility_id))
                .map((pair) => pair.program_id)
        );
        return programs.filter((program) => allowed.has(program.id));
    }, [form.data.destination_facility_id, programs, transferPairs]);

    useEffect(() => {
        if (!form.data.is_move) return;
        if (!form.data.destination_program_id) return;
        const valid = validDestinationPrograms.some((program) => program.id === Number(form.data.destination_program_id));
        if (!valid) {
            form.setData('destination_program_id', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.destination_facility_id, validDestinationPrograms.length, form.data.is_move]);

    useEffect(() => {
        if (!open) return;
        if (!destinationOptions.includes(form.data.discharge_destination)) {
            form.setData('discharge_destination', destinationOptions[0] ?? '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, form.data.discharge_disposition, destinationOptions.join('|')]);

    if (!open || !bed || !patient) return null;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!form.data.leave_details.trim()) {
            toast.error('Leave details are required.');
            return;
        }

        if (form.data.is_move && (!form.data.destination_facility_id || !form.data.destination_program_id)) {
            toast.error('Destination Location and Program are required for move.');
            return;
        }

        form.transform((data) => ({
            ...data,
            leave_details: data.leave_details.trim(),
            destination_facility_id: data.is_move ? Number(data.destination_facility_id) : (null as any),
            destination_program_id: data.is_move ? Number(data.destination_program_id) : (null as any),
        }));

        form.post(`/beds/${bed.id}/discharge`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Discharge failed.')),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" className="modal-backdrop" onClick={onClose} />
            <section className="card modal-panel relative z-10 w-full max-w-2xl p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-extrabold">Discharge Intake</h3>
                        <p className="mt-1 text-sm text-[var(--text-subtle)]">
                            {patient.first_name} {patient.last_name} from Bed {bed.bed_number}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="btn-secondary p-2" aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="field-label">Discharge Disposition</label>
                        <select
                            className="form-select"
                            value={form.data.discharge_disposition}
                            onChange={(e) => form.setData('discharge_disposition', e.target.value)}
                            required
                        >
                            {dispositions.map((disposition) => (
                                <option key={disposition} value={disposition}>
                                    {disposition}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="field-label">Destination</label>
                        <select
                            className="form-select"
                            value={form.data.discharge_destination}
                            onChange={(e) => form.setData('discharge_destination', e.target.value)}
                            required
                        >
                            {destinationOptions.map((destination) => (
                                <option key={destination} value={destination}>
                                    {destination}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="field-label">Leave Details</label>
                        <textarea
                            className="form-input min-h-[96px]"
                            value={form.data.leave_details}
                            onChange={(e) => form.setData('leave_details', e.target.value)}
                            required
                        />
                    </div>

                    <div className="rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-3">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-strong)]">
                            <input
                                type="checkbox"
                                checked={form.data.is_move}
                                onChange={(e) => form.setData('is_move', e.target.checked)}
                            />
                            Move to different Location and Program
                        </label>

                        {form.data.is_move && (
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="field-label">Destination Location</label>
                                    <select
                                        className="form-select"
                                        value={form.data.destination_facility_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'destination_facility_id',
                                                e.target.value ? Number(e.target.value) : ''
                                            )
                                        }
                                        required
                                    >
                                        <option value="">Select location</option>
                                        {facilities.map((facility) => (
                                            <option key={facility.id} value={facility.id}>
                                                {facility.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="field-label">Destination Program</label>
                                    <select
                                        className="form-select"
                                        value={form.data.destination_program_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'destination_program_id',
                                                e.target.value ? Number(e.target.value) : ''
                                            )
                                        }
                                        required
                                    >
                                        <option value="">Select program</option>
                                        {validDestinationPrograms.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Confirm Discharge'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
