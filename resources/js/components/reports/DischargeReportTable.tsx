import { format } from 'date-fns';
import { FormEvent, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Patient } from '../../types';

function formatDate(value?: string | null): string {
    if (!value) return '-';
    try {
        return format(new Date(value), 'MM/dd/yyyy');
    } catch {
        return value;
    }
}

interface Props {
    discharges: Patient[];
    filters?: {
        from?: string | null;
        to?: string | null;
    };
    baseUrl?: string;
    exportUrl?: string;
}

export default function DischargeReportTable({ discharges, filters, baseUrl = '/reports', exportUrl }: Props) {
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to, setTo] = useState(filters?.to ?? '');

    const exportHref = useMemo(() => {
        if (!exportUrl) return null;
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        const query = params.toString();
        return query ? `${exportUrl}?${query}` : exportUrl;
    }, [exportUrl, from, to]);

    function submit(e: FormEvent) {
        e.preventDefault();
        router.get(
            baseUrl,
            {
                from: from || null,
                to: to || null,
            },
            { preserveScroll: true, replace: true }
        );
    }

    return (
        <section className="card p-4">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Discharges</h3>
                    <p className="text-sm text-[var(--text-subtle)]">History of discharged intakes</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                    {discharges.length} records
                </span>
            </div>

            <form onSubmit={submit} className="mb-3 flex flex-wrap items-end gap-2">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">From</label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="input mt-1"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">To</label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="input mt-1"
                    />
                </div>
                <button type="submit" className="btn-secondary">
                    Apply
                </button>
                {exportHref && (
                    <a className="btn-secondary" href={exportHref}>
                        Download CSV
                    </a>
                )}
            </form>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="table-head border-b border-slate-200">
                            <th className="py-2 text-left">Discharged At</th>
                            <th className="text-left">First Name</th>
                            <th className="text-left">Last Name</th>
                            <th className="text-left">DOB</th>
                            <th className="text-left">Status</th>
                            <th className="text-left">Referral From</th>
                            <th className="text-left">Insurance</th>
                            <th className="text-left">Intake Date</th>
                            <th className="text-left">Discharge Date</th>
                            <th className="text-left">Discharged From</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discharges.map((patient) => {
                            const dischargedFrom =
                                patient.discharged_bed
                                    ? `${patient.discharged_bed.room?.name ?? 'Rm ?'} • ${patient.discharged_bed.bed_number}`
                                    : patient.discharged_bed_id
                                        ? `Bed ${patient.discharged_bed_id}`
                                        : '-';

                            return (
                                <tr key={patient.id} className="border-b border-slate-100 last:border-b-0">
                                    <td className="table-cell">{formatDate(patient.discharged_at ?? null)}</td>
                                    <td className="table-cell">{patient.first_name}</td>
                                    <td className="table-cell">{patient.last_name}</td>
                                    <td className="table-cell">{formatDate(patient.dob)}</td>
                                    <td className="table-cell">{patient.status === 'walk_in' ? 'Walk-In' : 'Referral'}</td>
                                    <td className="table-cell">{patient.referral_from ?? '-'}</td>
                                    <td className="table-cell">{patient.insurance ?? '-'}</td>
                                    <td className="table-cell">{formatDate(patient.intake_date)}</td>
                                    <td className="table-cell">{formatDate(patient.discharge_date ?? null)}</td>
                                    <td className="table-cell">{dischargedFrom}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
