import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import DischargeReportTable from '../../components/reports/DischargeReportTable';
import { PageProps, Patient } from '../../types';

interface Props extends PageProps {
    discharges: Patient[];
    bed_counts: {
        occupied: number;
        available: number;
        maintenance: number;
    };
    filters: {
        from?: string | null;
        to?: string | null;
    };
}

export default function ReportsIndex({ discharges, bed_counts, filters }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['discharges', 'bed_counts'] });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Reports" />
            <AppShell title="Reports" description="Discharges and operational reporting">
                <section className="card p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Bed Status Exports</h3>
                            <p className="text-sm text-[var(--text-subtle)]">Download CSV snapshots of current bed statuses.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <a className="btn-secondary justify-center" href="/reports/export/beds?status=occupied">
                            Download Occupied ({bed_counts.occupied})
                        </a>
                        <a className="btn-secondary justify-center" href="/reports/export/beds?status=available">
                            Download Available ({bed_counts.available})
                        </a>
                        <a className="btn-secondary justify-center" href="/reports/export/beds?status=maintenance">
                            Download Maintenance ({bed_counts.maintenance})
                        </a>
                    </div>
                </section>

                <DischargeReportTable
                    discharges={discharges}
                    filters={filters}
                    baseUrl="/reports"
                    exportUrl="/reports/export/discharges"
                />
            </AppShell>
        </>
    );
}
