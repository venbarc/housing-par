import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import DischargeReportTable from '../../components/reports/DischargeReportTable';
import { PageProps, Patient } from '../../types';

interface Props extends PageProps {
    discharges: Patient[];
}

export default function ReportsIndex({ discharges }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['discharges'] });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Reports" />
            <AppShell title="Reports" description="Discharges and operational reporting">
                <DischargeReportTable discharges={discharges} />
            </AppShell>
        </>
    );
}

