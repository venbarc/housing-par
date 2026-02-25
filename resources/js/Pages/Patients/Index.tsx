import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import PatientCreateForm from '../../components/forms/PatientCreateForm';
import PatientTable from '../../components/patients/PatientTable';
import { Bed, PageProps, Patient } from '../../types';

interface Props extends PageProps {
    patients: Patient[];
    beds: Bed[];
}

export default function PatientsIndex({ patients, beds }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['patients', 'beds'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Patients" />
            <AppShell title="Patients" description="Patient records, clinical status, and discharge workflow">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <PatientTable patients={patients} />
                    </div>
                    <PatientCreateForm beds={beds} />
                </div>
            </AppShell>
        </>
    );
}
