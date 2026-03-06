import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import FacilityPanel from '../../components/facilities/FacilityPanel';
import FacilityCreateForm from '../../components/forms/FacilityCreateForm';
import { Facility, PageProps, Program } from '../../types';

interface Props extends PageProps {
    facilities: Facility[];
    programs: Pick<Program, 'id' | 'name'>[];
}

export default function FacilitiesIndex({ facilities, programs }: Props) {
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

    useEffect(() => {
        const id = setInterval(() => router.reload({ only: ['facilities'] }), 8000);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <Head title="Name" />
            <AppShell title="Name" description="Group rooms and beds under named facilities">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <FacilityPanel
                            facilities={facilities}
                            programs={programs}
                            onEdit={setEditingFacility}
                            editingId={editingFacility?.id ?? null}
                        />
                    </div>
                    <FacilityCreateForm facility={editingFacility} onDone={() => setEditingFacility(null)} />
                </div>
            </AppShell>
        </>
    );
}
