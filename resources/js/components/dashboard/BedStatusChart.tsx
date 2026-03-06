import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Bed, BedStatus } from '../../types';
import { getBedStatusColors } from '../../lib/chart-theme';
import { useTheme } from '../layout/ThemeProvider';

interface Props {
    beds: Bed[];
}

const STATUS_LABELS: Record<BedStatus, string> = {
    available: 'Available',
    occupied: 'Occupied',
    cleaning: 'Cleaning',
    maintenance: 'Maintenance',
};

export default function BedStatusChart({ beds }: Props) {
    const { theme } = useTheme();

    const colors = useMemo(() => getBedStatusColors(), [theme]);

    const data = useMemo(() => {
        const counts: Record<BedStatus, number> = { available: 0, occupied: 0, cleaning: 0, maintenance: 0 };
        beds.forEach((bed) => counts[bed.status]++);
        return (Object.entries(counts) as [BedStatus, number][])
            .filter(([, count]) => count > 0)
            .map(([status, count]) => ({
                name: STATUS_LABELS[status],
                value: count,
                status,
            }));
    }, [beds]);

    const colorMap: Record<BedStatus, string> = {
        available: colors.available,
        occupied: colors.occupied,
        cleaning: colors.cleaning,
        maintenance: colors.maintenance,
    };

    const occupiedCount = beds.filter((b) => b.status === 'occupied').length;
    const occupancyPct = beds.length > 0 ? Math.round((occupiedCount / beds.length) * 100) : 0;

    if (beds.length === 0) {
        return (
            <section className="card p-4 flex items-center justify-center">
                <p className="text-sm text-[var(--text-subtle)]">No beds configured</p>
            </section>
        );
    }

    return (
        <motion.section
            className="card p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <h3 className="text-lg font-bold mb-1">Bed Status</h3>
            <p className="text-sm text-[var(--text-subtle)] mb-3">Distribution overview</p>

            <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {data.map((entry) => (
                                <Cell key={entry.status} fill={colorMap[entry.status]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-[var(--text-strong)]">{occupancyPct}%</span>
                    <span className="text-xs text-[var(--text-subtle)]">occupied</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {data.map((entry) => (
                    <span
                        key={entry.status}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]"
                    >
                        <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: colorMap[entry.status] }}
                        />
                        {entry.name} ({entry.value})
                    </span>
                ))}
            </div>
        </motion.section>
    );
}
