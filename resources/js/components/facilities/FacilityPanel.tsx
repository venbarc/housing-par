import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { Bed, Facility, Room } from '../../types';

interface Props {
    facilities: Facility[];
    onEdit?: (facility: Facility) => void;
    editingId?: number | null;
}

export default function FacilityPanel({ facilities, onEdit, editingId }: Props) {
    const [openFacilityIds, setOpenFacilityIds] = useState<number[]>([]);
    const [addingRoomFor, setAddingRoomFor] = useState<number | null>(null);

    const roomForm = useForm({
        name: '',
        notes: '',
        facility_id: 0,
    });

    const submitRoom = (event: FormEvent, facilityId: number) => {
        event.preventDefault();
        roomForm.setData('facility_id', facilityId);
        roomForm.post('/rooms', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Room added');
                roomForm.reset();
                setAddingRoomFor(null);
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not add room.')),
        });
    };

    const toggleOpen = (id: number) => {
        setOpenFacilityIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const renderBeds = (beds: Bed[] | undefined) => {
        if (!beds || beds.length === 0) return <span className="text-xs text-[var(--text-subtle)]">No beds</span>;

        return (
            <div className="mt-1 flex flex-wrap gap-1">
                {beds.map((bed) => {
                    const capacity = 1;
                    return (
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
                            <span className="text-[10px] text-[var(--text-muted)]">
                                {' '}
                                ({bed.patients?.length ?? 0}/{capacity})
                            </span>
                        </span>
                    );
                })}
            </div>
        );
    };

    const renderRooms = (rooms: Room[] | undefined) => {
        if (!rooms || rooms.length === 0) return <p className="text-sm text-[var(--text-subtle)]">No rooms yet.</p>;

        return (
            <div className="mt-2 space-y-2">
                {rooms.map((room) => (
                    <div key={room.id} className="rounded border border-[var(--border-subtle)] p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-[var(--text-strong)]">{room.name}</p>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">{room.notes || 'No notes'}</p>
                                {renderBeds(room.beds)}
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                                {room.beds?.length ?? 0} beds
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="card p-4" id="facilities">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Facilities</h3>
                    <p className="text-sm text-[var(--text-subtle)]">Each facility contains rooms and beds</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                    {facilities.length} total
                </span>
            </div>

            <div className="space-y-3">
                {facilities.map((facility) => {
                    const isOpen = openFacilityIds.includes(facility.id);
                    return (
                        <article
                            key={facility.id}
                            className={`surface-subtle p-3 ${editingId === facility.id ? 'ring-2 ring-blue-400/60' : ''}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 text-left"
                                        onClick={() => toggleOpen(facility.id)}
                                    >
                                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        <span className="font-semibold text-[var(--text-strong)]">{facility.name}</span>
                                    </button>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">{facility.notes || 'No notes'}</p>
                                    <p className="text-xs text-[var(--text-subtle)]">
                                        {facility.rooms?.length ?? 0} rooms ·{' '}
                                        {(facility.rooms ?? []).reduce((acc, r) => acc + (r.beds?.length ?? 0), 0)} beds
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {onEdit && (
                                        <button
                                            type="button"
                                            onClick={() => onEdit(facility)}
                                            className="btn-secondary px-3 py-1 text-xs"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setAddingRoomFor(addingRoomFor === facility.id ? null : facility.id)}
                                        className="btn-secondary flex items-center gap-1 px-3 py-1 text-xs"
                                    >
                                        <Plus size={12} /> Room
                                    </button>
                                    <form
                                        method="post"
                                        action={`/facilities/${facility.id}`}
                                        className="hidden"
                                    >
                                        {/* placeholder to keep semantics; delete handled elsewhere if added */}
                                    </form>
                                </div>
                            </div>

                            {addingRoomFor === facility.id && (
                                <form
                                    onSubmit={(e) => submitRoom(e, facility.id)}
                                    className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2"
                                >
                                    <div>
                                        <label className="field-label">Room Name</label>
                                        <input
                                            className="form-input"
                                            value={roomForm.data.name}
                                            onChange={(e) => roomForm.setData('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">Notes</label>
                                        <input
                                            className="form-input"
                                            value={roomForm.data.notes}
                                            onChange={(e) => roomForm.setData('notes', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 md:col-span-2">
                                        <button type="submit" className="btn-primary px-3" disabled={roomForm.processing}>
                                            Add Room
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-secondary px-3"
                                            onClick={() => {
                                                roomForm.reset();
                                                roomForm.clearErrors();
                                                setAddingRoomFor(null);
                                            }}
                                            disabled={roomForm.processing}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {isOpen && <div className="mt-3">{renderRooms(facility.rooms)}</div>}
                        </article>
                    );
                })}

                {facilities.length === 0 && (
                    <p className="py-4 text-sm text-[var(--text-subtle)]">No facilities yet.</p>
                )}
            </div>
        </section>
    );
}
