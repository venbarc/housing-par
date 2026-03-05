import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { BedDouble, Plus, Trash2 } from 'lucide-react';
import { Bed, Room } from '../../types';

interface Props {
    rooms: Room[];
    onEdit?: (room: Room) => void;
    editingId?: number | null;
}

export default function RoomPanel({ rooms, onEdit, editingId }: Props) {
    const [addingBedForRoom, setAddingBedForRoom] = useState<number | null>(null);

    const bedForm = useForm({
        bed_number: '',
        room_id: 0,
        bed_type: 'single' as Bed['bed_type'],
        status: 'available' as string,
    });

    const submitBed = (event: FormEvent, roomId: number) => {
        event.preventDefault();
        bedForm.setData('room_id', roomId);
        bedForm.post('/beds', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Bed added');
                bedForm.reset();
                setAddingBedForRoom(null);
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not add bed.')),
        });
    };

    return (
        <section className="card p-4" id="rooms">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Rooms</h3>
                    <p className="text-sm text-[var(--text-subtle)]">Manage rooms and their beds</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                    {rooms.length} rooms
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {rooms.map((room) => (
                    <article
                        key={room.id}
                        className={`surface-subtle p-3 ${editingId === room.id ? 'ring-2 ring-blue-400/60' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-[var(--text-strong)]">{room.name}</p>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {room.notes || 'No notes'}
                                </p>
                                <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-subtle)]">
                                    <BedDouble size={14} />
                                    <span>{room.beds?.length ?? 0} beds</span>
                                </div>

                                {/* Show beds in this room */}
                                {room.beds && room.beds.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {room.beds.map((bed) => (
                                            <span
                                                key={bed.id}
                                                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
                                                    bed.status === 'available'
                                                        ? 'bg-[var(--status-available-bg)] text-[var(--status-available)]'
                                                        : bed.status === 'occupied'
                                                          ? 'bg-[var(--status-occupied-bg)] text-[var(--status-occupied)]'
                                                          : bed.status === 'cleaning'
                                                            ? 'bg-[var(--status-cleaning-bg)] text-[var(--status-cleaning)]'
                                                            : 'bg-[var(--status-maintenance-bg)] text-[var(--status-maintenance)]'
                                                }`}
                                            >
                                                {bed.bed_number}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Add bed inline form */}
                                {addingBedForRoom === room.id && (
                                    <form onSubmit={(e) => submitBed(e, room.id)} className="mt-3 flex items-end gap-2">
                                        <div className="flex-1">
                                            <label className="field-label">Bed Number</label>
                                            <input
                                                className="form-input"
                                                value={bedForm.data.bed_number}
                                                onChange={(e) => bedForm.setData('bed_number', e.target.value)}
                                                placeholder="e.g. A1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="field-label">Status</label>
                                            <select
                                                className="form-select"
                                                value={bedForm.data.status}
                                                onChange={(e) => bedForm.setData('status', e.target.value)}
                                            >
                                                <option value="available">Available</option>
                                                <option value="maintenance">Maintenance</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="field-label">Bed Type</label>
                                            <select
                                                className="form-select"
                                                value={bedForm.data.bed_type}
                                                onChange={(e) => bedForm.setData('bed_type', e.target.value as Bed['bed_type'])}
                                            >
                                                <option value="single">Single</option>
                                                <option value="ada_single">ADA Single</option>
                                                <option value="double_top">Double - Top</option>
                                                <option value="double_bottom">Double - Bottom</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="btn-primary px-3 py-2 text-xs" disabled={bedForm.processing}>
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-secondary px-3 py-2 text-xs"
                                            onClick={() => { bedForm.reset(); setAddingBedForRoom(null); }}
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                {onEdit && (
                                    <button
                                        type="button"
                                        onClick={() => onEdit(room)}
                                        className="btn-secondary px-3 py-1 text-xs"
                                    >
                                        Edit
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        bedForm.reset();
                                        setAddingBedForRoom(addingBedForRoom === room.id ? null : room.id);
                                    }}
                                    className="btn-secondary flex items-center gap-1 px-3 py-1 text-xs"
                                >
                                    <Plus size={12} /> Bed
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
                {rooms.length === 0 && (
                    <p className="py-4 text-sm text-[var(--text-subtle)]">No rooms yet.</p>
                )}
            </div>
        </section>
    );
}
