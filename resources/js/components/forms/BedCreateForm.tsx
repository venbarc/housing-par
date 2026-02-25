import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bed, Ward } from '../../types';

interface Props {
    wards: Ward[];
}

export default function BedCreateForm({ wards }: Props) {
    const floors = useMemo(
        () => Array.from(new Set(wards.map((w) => w.floor ?? 'Unassigned'))),
        [wards],
    );
    const [floor, setFloor] = useState(floors[0] ?? 'Unassigned');

    const form = useForm({
        bed_number: '',
        ward_id: wards.find((w) => (w.floor ?? 'Unassigned') === floor)?.id ?? wards[0]?.id ?? '',
        room: '',
        status: 'available' as Bed['status'],
    });

    useEffect(() => {
        const first = wards.find((w) => (w.floor ?? 'Unassigned') === floor);
        if (first) form.setData('ward_id', first.id);
    }, [floor, wards]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/beds', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not create bed.')),
        });
    };

    return (
        <form onSubmit={submit} className="card p-4">
            <div className="mb-3">
                <h3 className="text-lg font-bold">Create Bed</h3>
                <p className="text-sm text-slate-500">Register a new bed location and status</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="field-label">Bed Number</label>
                    <input
                        className="form-input"
                        value={form.data.bed_number}
                        onChange={(event) => form.setData('bed_number', event.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="field-label">Floor</label>
                    <select
                        className="form-select"
                        value={floor}
                        onChange={(event) => setFloor(event.target.value)}
                    >
                        {floors.map((f) => (
                            <option key={f} value={f}>Floor {f}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="field-label">Ward</label>
                    <select
                        className="form-select"
                        value={form.data.ward_id}
                        onChange={(event) => form.setData('ward_id', Number(event.target.value))}
                        required
                    >
                        {wards
                            .filter((w) => (w.floor ?? 'Unassigned') === floor)
                            .map((ward) => (
                            <option key={ward.id} value={ward.id}>{ward.name}</option>
                            ))}
                    </select>
                </div>
                <div>
                    <label className="field-label">Room</label>
                    <input
                        className="form-input"
                        value={form.data.room}
                        onChange={(event) => form.setData('room', event.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="field-label">Status</label>
                    <select
                        className="form-select"
                        value={form.data.status}
                        onChange={(event) => form.setData('status', event.target.value as Bed['status'])}
                    >
                        {(['available', 'occupied', 'cleaning', 'maintenance'] as const).map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button type="submit" className="btn-primary mt-4 w-full" disabled={form.processing}>
                {form.processing ? 'Saving...' : 'Save Bed'}
            </button>
        </form>
    );
}
