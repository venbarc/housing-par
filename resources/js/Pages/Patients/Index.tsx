import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import DischargeModal from '../../components/discharge/DischargeModal';
import PatientCreateForm from '../../components/forms/PatientCreateForm';
import PatientTable from '../../components/patients/PatientTable';
import { Bed, DischargeOptionsMap, Facility, PageProps, Patient, Program, TransferPair } from '../../types';

interface Props extends PageProps {
    patients: Patient[];
    beds: Bed[];
    transfer_facilities: Facility[];
    transfer_programs: Program[];
    transfer_pairs: TransferPair[];
    discharge_options: DischargeOptionsMap;
}

export default function PatientsIndex({
    patients,
    beds,
    transfer_facilities,
    transfer_programs,
    transfer_pairs,
    discharge_options,
}: Props) {
    const [dischargeTarget, setDischargeTarget] = useState<{ bed: Bed; patient: Patient } | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['patients', 'beds'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Patients" />
            <AppShell title="Patients" description="Intake records, bed assignment, and discharge workflow">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <PatientTable patients={patients} onDischarge={(bed, patient) => setDischargeTarget({ bed, patient })} />
                    </div>
                    <PatientCreateForm beds={beds} />
                </div>
            </AppShell>

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
