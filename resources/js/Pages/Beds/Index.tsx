import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import BedCanvas from '../../components/dashboard/BedCanvas';
import BedCreateForm from '../../components/forms/BedCreateForm';
import BedAssignmentForm from '../../components/forms/BedAssignmentForm';
import { Bed, Document, PageProps, Patient, Ward } from '../../types';

interface Props extends PageProps {
    beds: Bed[];
    patients: Patient[];
    wards: Ward[];
    documents: Document[];
}

export default function BedsIndex({ beds, patients, wards, documents }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['beds', 'patients'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Beds" />
            <AppShell title="Beds" description="Manage bed layout, status, and assignment">
                <div className="grid grid-cols-1 gap-4 2xl:grid-cols-3">
                    <div className="2xl:col-span-2">
                        <BedCanvas beds={beds} patients={patients} wards={wards} documents={documents} />
                    </div>
                    <div className="space-y-4">
                        <BedCreateForm wards={wards} />
                        <BedAssignmentForm beds={beds} patients={patients} />
                    </div>
                </div>
            </AppShell>
        </>
    );
}
