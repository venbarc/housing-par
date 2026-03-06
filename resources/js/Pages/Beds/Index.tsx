import { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import BedListTable from '../../components/beds/BedListTable';
import DischargeModal from '../../components/discharge/DischargeModal';
import { Bed, DischargeOptionsMap, Document, Facility, PageProps, Patient, Program, Room, TransferPair } from '../../types';
import BedDetailModal from '../../components/dashboard/BedDetailModal';
import BedCreateModal from '../../components/forms/BedCreateModal';
import BedAllocateModal from '../../components/forms/BedAllocateModal';
import RoomCreateModal from '../../components/forms/RoomCreateModal';

interface Props extends PageProps {
    beds: Bed[];
    patients: Patient[];
    rooms: Room[];
    facilities: Facility[];
    transfer_facilities: Facility[];
    transfer_programs: Program[];
    transfer_pairs: TransferPair[];
    discharge_options: DischargeOptionsMap;
    documents: Document[];
}

export default function BedsIndex({
    beds,
    patients,
    rooms,
    facilities,
    transfer_facilities,
    transfer_programs,
    transfer_pairs,
    discharge_options,
    documents,
}: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['beds', 'patients'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
    const [createBedOpen, setCreateBedOpen] = useState(false);
    const [createRoomOpen, setCreateRoomOpen] = useState(false);
    const [intakeBedId, setIntakeBedId] = useState<number | null>(null);
    const [dischargeTarget, setDischargeTarget] = useState<{ bed: Bed; patient: Patient } | null>(null);
    const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

    // Derive distinct programs from rooms at this location
    const locationPrograms = useMemo(() => {
        const seen = new Map<number, Program>();
        for (const room of rooms) {
            if (room.program && !seen.has(room.program.id)) {
                seen.set(room.program.id, room.program);
            }
        }
        return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [rooms]);

    // Filter beds and rooms by selected program
    const filteredBeds = useMemo(
        () => selectedProgramId === null ? beds : beds.filter((b) => b.room?.program_id === selectedProgramId),
        [beds, selectedProgramId],
    );

    const filteredRooms = useMemo(
        () => selectedProgramId === null ? rooms : rooms.filter((r) => r.program_id === selectedProgramId),
        [rooms, selectedProgramId],
    );

    const selectedBed = useMemo(() => beds.find((b) => b.id === selectedBedId) ?? null, [beds, selectedBedId]);
    const intakeBed = useMemo(() => beds.find((b) => b.id === intakeBedId) ?? null, [beds, intakeBedId]);

    return (
        <>
            <Head title="Beds" />
            <AppShell
                title="Beds"
                description="Manage bed list, status, and intake workflow"
                actions={
                    <div className="flex gap-2">
                        <button type="button" className="btn-secondary !px-3 !py-2" onClick={() => setCreateRoomOpen(true)}>
                            <Plus className="h-4 w-4" />
                            <span className="ml-1">Create Room</span>
                        </button>
                        <button type="button" className="btn-primary !px-3 !py-2" onClick={() => setCreateBedOpen(true)}>
                            <Plus className="h-4 w-4" />
                            <span className="ml-1">Create Bed</span>
                        </button>
                    </div>
                }
            >
                <BedListTable
                    beds={filteredBeds}
                    programs={locationPrograms}
                    selectedProgramId={selectedProgramId}
                    onProgramChange={setSelectedProgramId}
                    onDischarge={(bed, patient) => setDischargeTarget({ bed, patient })}
                    onBedClick={(bed) => {
                        const hasOccupant = (bed.patients?.length ?? 0) > 0;
                        if (hasOccupant) {
                            setSelectedBedId(bed.id);
                        } else {
                            setIntakeBedId(bed.id);
                        }
                    }}
                />
            </AppShell>

            <BedDetailModal
                bed={selectedBed}
                room={selectedBed ? rooms.find((r) => r.id === selectedBed.room_id) : undefined}
                rooms={rooms}
                documents={selectedBed ? documents.filter((doc) => doc.bed_id === selectedBed.id) : []}
                onDischarge={(bed, patient) => setDischargeTarget({ bed, patient })}
                onClose={() => setSelectedBedId(null)}
            />

            <BedCreateModal
                open={createBedOpen}
                rooms={filteredRooms}
                facilities={facilities}
                onClose={() => setCreateBedOpen(false)}
            />

            <RoomCreateModal
                open={createRoomOpen}
                facilities={facilities}
                programs={locationPrograms}
                programId={selectedProgramId ?? undefined}
                onClose={() => setCreateRoomOpen(false)}
            />

            <BedAllocateModal
                open={Boolean(intakeBedId)}
                bed={intakeBed}
                patients={patients}
                onClose={() => setIntakeBedId(null)}
            />

            <DischargeModal
                open={Boolean(dischargeTarget)}
                bed={dischargeTarget?.bed ?? null}
                patient={dischargeTarget?.patient ?? null}
                dischargeOptions={discharge_options}
                facilities={transfer_facilities}
                programs={transfer_programs}
                transferPairs={transfer_pairs}
                onClose={() => setDischargeTarget(null)}
            />
        </>
    );
}
