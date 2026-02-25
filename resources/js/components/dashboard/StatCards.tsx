import { Activity, BedDouble, FileText, Users } from 'lucide-react';
import { Bed, Notification, Patient } from '../../types';

interface Props {
    beds: Bed[];
    patients: Patient[];
    notifications: Notification[];
}

export default function StatCards({ beds, patients, notifications }: Props) {
    const occupiedBeds = beds.filter((bed) => bed.status === 'occupied').length;
    const availableBeds = beds.filter((bed) => bed.status === 'available').length;
    const criticalPatients = patients.filter((patient) => patient.status === 'critical').length;
    const unreadNotifications = notifications.filter((notification) => !notification.is_read).length;

    const stats = [
        {
            label: 'Bed Occupancy',
            value: `${occupiedBeds}/${beds.length || 0}`,
            helper: `${availableBeds} available`,
            icon: BedDouble,
        },
        {
            label: 'Active Patients',
            value: `${patients.length}`,
            helper: `${criticalPatients} critical`,
            icon: Users,
        },
        {
            label: 'Unread Alerts',
            value: `${unreadNotifications}`,
            helper: `${notifications.length} total events`,
            icon: Activity,
        },
        {
            label: 'Recorded Events',
            value: `${notifications.length}`,
            helper: 'Live activity stream',
            icon: FileText,
        },
    ];

    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, helper, icon: Icon }) => (
                <article key={label} className="card p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">{label}</p>
                        <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
                            <Icon className="h-4 w-4" />
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-[var(--text-strong)]">{value}</p>
                    <p className="mt-1 text-sm text-[var(--text-subtle)]">{helper}</p>
                </article>
            ))}
        </section>
    );
}
