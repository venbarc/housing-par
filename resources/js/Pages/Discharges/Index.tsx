import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import DischargeReportTable from '../../components/reports/DischargeReportTable';
import { PageProps, Patient } from '../../types';

interface Props extends PageProps {
    discharges: Patient[];
    filters: {
        from?: string | null;
        to?: string | null;
    };
}

export default function DischargesIndex({ discharges, filters }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['discharges'] });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Discharges" />
            <AppShell title="Discharges" description="History of discharged intakes">
                <DischargeReportTable
                    discharges={discharges}
                    filters={filters}
                    baseUrl="/discharges"
                    exportUrl="/reports/export/discharges"
                />
            </AppShell>
        </>
    );
}

