import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Facility, Program, Room } from '../../types';

interface Props {
    room?: Room | null;
    onDone?: () => void;
    facilities?: Facility[];
    facilityId?: number;
    programs?: Program[];
    programId?: number;
    variant?: 'card' | 'plain';
}

export default function RoomCreateForm({ room, onDone, facilities = [], facilityId, programs = [], programId, variant = 'card' }: Props) {
    const form = useForm({
        name: '',
        notes: '',
        facility_id: facilityId ?? (facilities[0]?.id ?? ''),
        program_id: programId ?? (programs[0]?.id ?? ''),
    });

    const isEditing = Boolean(room);

    useEffect(() => {
        if (room) {
            form.setData('name', room.name);
            form.setData('notes', room.notes ?? '');
            form.setData('facility_id', room.facility_id);
            form.setData('program_id', room.program_id);
        } else {
            form.reset();
            if (facilityId) {
                form.setData('facility_id', facilityId);
            } else if (facilities[0]) {
                form.setData('facility_id', facilities[0].id);
            }
            if (programId) {
                form.setData('program_id', programId);
            } else if (programs[0]) {
                form.setData('program_id', programs[0].id);
            }
        }
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room?.id]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const action = isEditing ? form.patch : form.post;
        const url = isEditing && room ? `/rooms/${room.id}` : '/rooms';

        action(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? 'Room updated' : 'Room created');
                form.reset();
                onDone?.();
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not save room.')),
        });
    };

    const content = (
        <>
            <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className="field-label">Facility</label>
                    <select
                        className="form-select"
                        value={form.data.facility_id}
                        onChange={(e) => form.setData('facility_id', Number(e.target.value))}
                        required
                        disabled={Boolean(facilityId)}
                    >
                        {facilities.map((facility) => (
                            <option value={facility.id} key={facility.id}>
                                {facility.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="field-label">Program</label>
                    <select
                        className="form-select"
                        value={form.data.program_id}
                        onChange={(e) => form.setData('program_id', Number(e.target.value))}
                        required
                        disabled={Boolean(programId)}
                    >
                        {programs.map((program) => (
                            <option value={program.id} key={program.id}>
                                {program.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="field-label">Room Name</label>
                    <input className="form-input" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                </div>
                <div>
                    <label className="field-label">Notes</label>
                    <textarea className="form-textarea" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                </div>
            </div>

            <button type="submit" className="btn-primary mt-4 w-full" disabled={form.processing}>
                {form.processing ? 'Saving...' : isEditing ? 'Update Room' : 'Save Room'}
            </button>
            {isEditing && (
                <button
                    type="button"
                    className="btn-secondary mt-2 w-full"
                    onClick={() => {
                        form.reset();
                        form.clearErrors();
                        onDone?.();
                    }}
                    disabled={form.processing}
                >
                    Cancel edit
                </button>
            )}
        </>
    );

    if (variant === 'plain') {
        return <form onSubmit={submit}>{content}</form>;
    }

    return (
        <form onSubmit={submit} className="card p-4">
            <div className="mb-3">
                <h3 className="text-lg font-bold">{isEditing ? 'Edit Room' : 'Create Room'}</h3>
                <p className="text-sm text-[var(--text-subtle)]">
                    {isEditing ? 'Update room details' : 'Add a new room'}
                </p>
            </div>
            {content}
        </form>
    );
}
