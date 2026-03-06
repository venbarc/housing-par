import { Activity, BedDouble, FileText, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Bed, Notification, Patient } from '../../types';
import AnimatedValue from './AnimatedValue';
import OccupancyGauge from './OccupancyGauge';

interface Props {
    beds: Bed[];
    patients: Patient[];
    notifications: Notification[];
}

const ACCENT_STYLES = [
    { gradient: 'linear-gradient(135deg, #3a7fd6, #6fa7f5)', bg: 'rgba(61,125,226,0.10)', fg: '#3a7fd6' },
    { gradient: 'linear-gradient(135deg, #0f9c6c, #34d399)', bg: 'rgba(16,185,129,0.10)', fg: '#0f9c6c' },
    { gradient: 'linear-gradient(135deg, #c38400, #fbbf24)', bg: 'rgba(195,132,0,0.10)', fg: '#c38400' },
    { gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', bg: 'rgba(124,58,237,0.10)', fg: '#7c3aed' },
];

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function StatCards({ beds, patients, notifications }: Props) {
    const occupiedBeds = beds.filter((bed) => bed.status === 'occupied').length;
    const availableBeds = beds.filter((bed) => bed.status === 'available').length;
    const activeIntakes = patients.filter((patient) => !patient.discharged_at).length;
    const referralIntakes = patients.filter((patient) => !patient.discharged_at && patient.status === 'referral').length;
    const unreadNotifications = notifications.filter((notification) => !notification.is_read).length;

    const stats = [
        {
            label: 'Bed Occupancy',
            value: occupiedBeds,
            displayValue: `${occupiedBeds}/${beds.length || 0}`,
            helper: `${availableBeds} available`,
            icon: BedDouble,
            isOccupancy: true,
        },
        {
            label: 'Active Patients',
            value: activeIntakes,
            displayValue: `${activeIntakes}`,
            helper: `${referralIntakes} referrals`,
            icon: Users,
            isOccupancy: false,
        },
        {
            label: 'Unread Alerts',
            value: unreadNotifications,
            displayValue: `${unreadNotifications}`,
            helper: `${notifications.length} total events`,
            icon: Activity,
            isOccupancy: false,
        },
        {
            label: 'Recorded Events',
            value: notifications.length,
            displayValue: `${notifications.length}`,
            helper: 'Live activity stream',
            icon: FileText,
            isOccupancy: false,
            showPulse: true,
        },
    ];

    return (
        <motion.section
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {stats.map(({ label, value, displayValue, helper, icon: Icon, isOccupancy, showPulse }, i) => (
                <motion.article
                    key={label}
                    className="card card-interactive relative overflow-hidden p-4"
                    variants={cardVariants}
                >
                    {/* Colored top accent strip */}
                    <div
                        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                        style={{ background: ACCENT_STYLES[i].gradient }}
                    />

                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">{label}</p>
                        <span
                            className="rounded-lg p-2"
                            style={{ background: ACCENT_STYLES[i].bg, color: ACCENT_STYLES[i].fg }}
                        >
                            <Icon className="h-4 w-4" />
                        </span>
                    </div>

                    {isOccupancy ? (
                        <div className="flex items-center gap-3">
                            <OccupancyGauge occupied={occupiedBeds} total={beds.length} />
                            <div>
                                <p className="text-2xl font-extrabold text-[var(--text-strong)]">{displayValue}</p>
                                <p className="mt-0.5 text-sm text-[var(--text-subtle)]">{helper}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-2xl font-extrabold text-[var(--text-strong)]">
                                <AnimatedValue value={value} />
                            </p>
                            <p className="mt-1 text-sm text-[var(--text-subtle)] flex items-center gap-1">
                                {showPulse && <span className="pulse-dot" />}
                                {helper}
                            </p>
                        </>
                    )}
                </motion.article>
            ))}
        </motion.section>
    );
}
