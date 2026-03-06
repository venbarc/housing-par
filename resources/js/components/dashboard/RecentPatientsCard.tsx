import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { Patient } from '../../types';

interface Props {
    patients: Patient[];
}

export default function RecentPatientsCard({ patients }: Props) {
    const active = patients.filter((p) => !p.discharged_at);
    const referrals = active.filter((p) => p.status === 'referral').length;
    const walkIns = active.filter((p) => p.status === 'walk_in').length;

    const recent = [...active]
        .sort((a, b) => new Date(b.intake_date).getTime() - new Date(a.intake_date).getTime())
        .slice(0, 5);

    return (
        <section className="card p-4">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Patients</h3>
                    <p className="text-sm text-[var(--text-subtle)]">{active.length} active records</p>
                </div>
                <Link href="/patients" className="btn-link">Open</Link>
            </div>

            {recent.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-[var(--border-soft)]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)]">
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Type</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Intake</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map((p) => (
                                <tr key={p.id} className="border-b border-[var(--border-soft)] last:border-0">
                                    <td className="px-3 py-2 font-medium text-[var(--text-strong)]">
                                        {p.first_name} {p.last_name}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`badge border-transparent text-xs ${
                                            p.status === 'referral'
                                                ? 'bg-status-occupied text-status-occupied'
                                                : 'bg-status-available text-status-available'
                                        }`}>
                                            {p.status === 'referral' ? 'Referral' : 'Walk-In'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right text-[var(--text-muted)]">
                                        {format(new Date(p.intake_date), 'MMM d')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-[var(--text-subtle)]">No active patients.</p>
            )}

            <div className="mt-3 flex gap-2">
                <span className="badge border-transparent bg-status-occupied text-status-occupied text-xs">
                    {referrals} Referrals
                </span>
                <span className="badge border-transparent bg-status-available text-status-available text-xs">
                    {walkIns} Walk-Ins
                </span>
            </div>
        </section>
    );
}
