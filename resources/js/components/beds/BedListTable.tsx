import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useMemo } from 'react';
import { Bed } from '../../types';
import { bedStatusMeta } from '../../lib/status';

function bedTypeLabel(type: Bed['bed_type']): string {
    switch (type) {
        case 'single':
            return 'Single';
        case 'ada_single':
            return 'ADA Single';
        case 'double_top':
            return 'Double - Top';
        case 'double_bottom':
            return 'Double - Bottom';
        default:
            return String(type);
    }
}

function formatDate(value?: string | null): string {
    if (!value) return '-';
    try {
        return format(new Date(value), 'MM/dd/yyyy');
    } catch {
        return value;
    }
}

interface Props {
    beds: Bed[];
    onBedClick?: (bed: Bed) => void;
}

export default function BedListTable({ beds, onBedClick }: Props) {
    const sortedBeds = useMemo(() => {
        const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

        const bedOrderKey = (bed: Bed): string => {
            if (bed.bed_type === 'double_top') return `0-${bed.bed_number}`;
            if (bed.bed_type === 'double_bottom') return `1-${bed.bed_number}`;
            return `2-${bed.bed_number}`;
        };

        return beds
            .slice()
            .sort((a, b) => {
                const roomA = a.room?.name ?? '';
                const roomB = b.room?.name ?? '';
                const roomCmp = collator.compare(roomA, roomB);
                if (roomCmp !== 0) return roomCmp;
                return collator.compare(bedOrderKey(a), bedOrderKey(b));
            });
    }, [beds]);

    const discharge = (bedId: number, patientId: number) => {
        router.post(`/beds/${bedId}/discharge`, { patient_id: patientId }, {
            preserveScroll: true,
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not discharge.')),
        });
    };

    return (
        <section className="card p-4">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Beds</h3>
                    <p className="text-sm text-[var(--text-subtle)]">Listed view of occupancy and intake details</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                    {beds.length} beds
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="table-head border-b border-slate-200">
                            <th className="py-2 text-left">Rm #</th>
                            <th className="text-left">Bed</th>
                            <th className="text-left">Bed Type</th>
                            <th className="text-left">First Name</th>
                            <th className="text-left">Last Name</th>
                            <th className="text-left">DOB</th>
                            <th className="text-left">Status</th>
                            <th className="text-left">Referral From</th>
                            <th className="text-left">Insurance</th>
                            <th className="text-left">Intake Date</th>
                            <th className="text-left">Discharge Date</th>
                            <th className="text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBeds.map((bed) => {
                            const bedStatus = bedStatusMeta[bed.status];
                            const occupant = bed.patients?.[0] ?? null;
                            const occupantStatusLabel =
                                occupant?.status === 'walk_in'
                                    ? 'Walk-In'
                                    : occupant?.status === 'referral'
                                        ? 'Referral'
                                        : '-';

                            return (
                                <tr
                                    key={bed.id}
                                    className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-[color:var(--surface-soft)]"
                                    onClick={() => onBedClick?.(bed)}
                                >
                                    <td className="table-cell">{bed.room?.name ?? '-'}</td>
                                    <td className="table-cell">
                                        <button
                                            type="button"
                                            className="btn-link text-left"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onBedClick?.(bed);
                                            }}
                                        >
                                            {bed.bed_number}
                                        </button>
                                        <div className="mt-1">
                                            <span className={`badge border-transparent ${bedStatus.bg} ${bedStatus.color}`}>
                                                {bedStatus.label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="table-cell">{bedTypeLabel(bed.bed_type)}</td>
                                    <td className="table-cell">{occupant?.first_name ?? '-'}</td>
                                    <td className="table-cell">{occupant?.last_name ?? '-'}</td>
                                    <td className="table-cell">{formatDate(occupant?.dob)}</td>
                                    <td className="table-cell">{occupantStatusLabel}</td>
                                    <td className="table-cell">{occupant?.referral_from ?? '-'}</td>
                                    <td className="table-cell">{occupant?.insurance ?? '-'}</td>
                                    <td className="table-cell">{formatDate(occupant?.intake_date)}</td>
                                    <td className="table-cell">{formatDate(occupant?.discharge_date)}</td>
                                    <td className="table-cell">
                                        {occupant ? (
                                            <button
                                                type="button"
                                                className="btn-secondary !px-3 !py-1.5 !text-xs text-red-600 border-red-200"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    discharge(bed.id, occupant.id);
                                                }}
                                            >
                                                Discharge
                                            </button>
                                        ) : (
                                            <span className="text-xs text-[var(--text-subtle)]">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
