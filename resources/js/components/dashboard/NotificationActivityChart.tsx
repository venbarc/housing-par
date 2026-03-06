import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Notification, NotificationType } from '../../types';
import { getCSSVar } from '../../lib/chart-theme';
import { useTheme } from '../layout/ThemeProvider';

interface Props {
    notifications: Notification[];
}

const TYPE_LABELS: Record<NotificationType, string> = {
    admission: 'Admission',
    bed_occupied: 'Bed Occupied',
    bed_vacated: 'Bed Vacated',
    critical: 'Critical',
    doc_uploaded: 'Doc Uploaded',
    upcoming_discharge: 'Discharge',
};

const TYPE_VAR: Record<NotificationType, string> = {
    admission: '--status-available-fg',
    bed_occupied: '--status-occupied-fg',
    bed_vacated: '--status-available-fg',
    critical: '--status-maintenance-fg',
    doc_uploaded: '--status-cleaning-fg',
    upcoming_discharge: '--primary-500',
};

export default function NotificationActivityChart({ notifications }: Props) {
    const { theme } = useTheme();

    const { data, colorMap } = useMemo(() => {
        const counts: Partial<Record<NotificationType, number>> = {};
        notifications.forEach((n) => {
            counts[n.type] = (counts[n.type] || 0) + 1;
        });

        const cm: Record<string, string> = {};
        const d = (Object.entries(counts) as [NotificationType, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => {
                cm[TYPE_LABELS[type]] = getCSSVar(TYPE_VAR[type]);
                return { name: TYPE_LABELS[type], count };
            });

        return { data: d, colorMap: cm };
    }, [notifications, theme]);

    if (data.length === 0) {
        return (
            <section className="card p-4 flex items-center justify-center">
                <p className="text-sm text-[var(--text-subtle)]">No activity yet</p>
            </section>
        );
    }

    return (
        <motion.section
            className="card p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
            <h3 className="text-lg font-bold mb-1">Activity Breakdown</h3>
            <p className="text-sm text-[var(--text-subtle)] mb-3">Events by type</p>

            <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 160)}>
                <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--surface-soft)' }}
                        contentStyle={{
                            background: 'var(--card)',
                            border: '1px solid var(--border-soft)',
                            borderRadius: '0.75rem',
                            color: 'var(--text-strong)',
                            fontSize: 13,
                        }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                        {data.map((entry) => (
                            <Cell key={entry.name} fill={colorMap[entry.name]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.section>
    );
}
