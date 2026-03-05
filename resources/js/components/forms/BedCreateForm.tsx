import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Bed, Facility, Room } from '../../types';

interface Props {
    rooms: Room[];
    facilities: Facility[];
    variant?: 'card' | 'plain';
    onDone?: () => void;
}

export default function BedCreateForm({ rooms, facilities, variant = 'card', onDone }: Props) {
    const initialFacility = String(facilities[0]?.id ?? '');
    const roomsForFacility = (facilityId: number | string) =>
        facilityId === ''
            ? rooms
            : rooms.filter((room) => String(room.facility_id) === String(facilityId));

    const form = useForm({
        bed_number: '',
        room_id: (roomsForFacility(initialFacility)[0]?.id ?? null) as number | null,
        status: 'available' as Bed['status'],
        facility_id: initialFacility,
        bed_type: 'single' as Bed['bed_type'],
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/beds', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                toast.success('Bed created');
                onDone?.();
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not create bed.')),
        });
    };

    const content = (
        <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="field-label">Bed Type</label>
                    <select
                        className="form-select"
                        value={form.data.bed_type}
                        onChange={(event) => form.setData('bed_type', event.target.value as Bed['bed_type'])}
                    >
                        <option value="single">Single</option>
                        <option value="ada_single">ADA Single</option>
                        <option value="double_top">Double - Top</option>
                        <option value="double_bottom">Double - Bottom</option>
                    </select>
                </div>
                <div>
                    <label className="field-label">Name</label>
                    <select
                        className="form-select"
                        value={form.data.facility_id}
                        onChange={(event) => {
                            const nextFacility = event.target.value;
                            const nextRooms = roomsForFacility(nextFacility);
                            form.setData('facility_id', nextFacility);
                            form.setData('room_id', (nextRooms[0]?.id ?? null) as number | null);
                        }}
                    >
                        {facilities.map((facility) => (
                            <option key={facility.id} value={facility.id}>
                                {facility.name}
                            </option>
                        ))}
                    </select>
                </div>
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
                    <label className="field-label">Room</label>
                    <select
                        className="form-select"
                        value={form.data.room_id ?? ''}
                        onChange={(event) => form.setData('room_id', event.target.value ? Number(event.target.value) : null)}
                        required
                    >
                        <option value="">Select room</option>
                        {roomsForFacility(form.data.facility_id).map((room) => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="field-label">Status</label>
                    <select
                        className="form-select"
                        value={form.data.status}
                        onChange={(event) => form.setData('status', event.target.value as Bed['status'])}
                    >
                        {(['available', 'maintenance'] as const).map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button type="submit" className="btn-primary mt-4 w-full" disabled={form.processing}>
                {form.processing ? 'Saving...' : 'Save Bed'}
            </button>
        </>
    );

    if (variant === 'plain') {
        return (
            <form onSubmit={submit}>
                {content}
            </form>
        );
    }

    return (
        <form onSubmit={submit} className="card p-4">
            <div className="mb-3">
                <h3 className="text-lg font-bold">Create Bed</h3>
                <p className="text-sm text-slate-500">Register a new bed in a room</p>
            </div>
            {content}
        </form>
    );
}
