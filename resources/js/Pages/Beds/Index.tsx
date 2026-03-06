import { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import BedListTable from '../../components/beds/BedListTable';
import { Bed, Document, Facility, PageProps, Patient, Room } from '../../types';
import BedDetailModal from '../../components/dashboard/BedDetailModal';
import BedCreateModal from '../../components/forms/BedCreateModal';
import BedAllocateModal from '../../components/forms/BedAllocateModal';

interface Props extends PageProps {
    beds: Bed[];
    patients: Patient[];
    rooms: Room[];
    facilities: Facility[];
    documents: Document[];
}

export default function BedsIndex({ beds, patients, rooms, facilities, documents }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['beds', 'patients'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
    const [createBedOpen, setCreateBedOpen] = useState(false);
    const [intakeBedId, setIntakeBedId] = useState<number | null>(null);

    const selectedBed = useMemo(() => beds.find((b) => b.id === selectedBedId) ?? null, [beds, selectedBedId]);
    const intakeBed = useMemo(() => beds.find((b) => b.id === intakeBedId) ?? null, [beds, intakeBedId]);

    return (
        <>
            <Head title="Beds" />
            <AppShell
                title="Beds"
                description="Manage bed list, status, and intake workflow"
                actions={
                    <button type="button" className="btn-primary !px-3 !py-2" onClick={() => setCreateBedOpen(true)}>
                        <Plus className="h-4 w-4" />
                        <span className="ml-1">Create Bed</span>
                    </button>
                }
            >
                <BedListTable
                    beds={beds}
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
                onClose={() => setSelectedBedId(null)}
            />

            <BedCreateModal
                open={createBedOpen}
                rooms={rooms}
                facilities={facilities}
                onClose={() => setCreateBedOpen(false)}
            />

            <BedAllocateModal
                open={Boolean(intakeBedId)}
                bed={intakeBed}
                patients={patients}
                onClose={() => setIntakeBedId(null)}
            />
        </>
    );
}
