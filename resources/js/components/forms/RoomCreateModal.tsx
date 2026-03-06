import { X } from 'lucide-react';
import RoomCreateForm from './RoomCreateForm';
import { Facility, Program } from '../../types';

interface Props {
    open: boolean;
    facilities: Facility[];
    programs: Program[];
    facilityId?: number;
    programId?: number;
    onClose: () => void;
}

export default function RoomCreateModal({ open, facilities, programs, facilityId, programId, onClose }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" className="modal-backdrop" onClick={onClose} />
            <section className="card modal-panel relative z-10 w-full max-w-xl p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-extrabold">Create Room</h3>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-subtle)' }}>
                            Add a new room to a facility
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="btn-secondary p-2" aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <RoomCreateForm
                    facilities={facilities}
                    programs={programs}
                    facilityId={facilityId}
                    programId={programId}
                    variant="plain"
                    onDone={onClose}
                />
            </section>
        </div>
    );
}
