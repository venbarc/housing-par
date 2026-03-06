import { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Bed, Document, Notification, PageProps, Patient, Room } from '../types';
import AppShell from '../components/layout/AppShell';
import StatCards from '../components/dashboard/StatCards';
import BedStatusChart from '../components/dashboard/BedStatusChart';
import NotificationActivityChart from '../components/dashboard/NotificationActivityChart';
import RecentPatientsCard from '../components/dashboard/RecentPatientsCard';
import RecentDocumentsCard from '../components/dashboard/RecentDocumentsCard';
import RoomOccupancyCard from '../components/dashboard/RoomOccupancyCard';
import NotificationList from '../components/notifications/NotificationList';
import { bedStatusMeta } from '../lib/status';

interface Props extends PageProps {
    beds: Bed[];
    patients: Patient[];
    rooms: Room[];
    documents: Document[];
    notifications: Notification[];
}

export default function Dashboard({ beds, patients, rooms, documents, notifications }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['beds', 'patients', 'documents', 'notifications', 'rooms'],
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const recentBeds = beds.slice(0, 12);
    const recentNotifications = notifications.slice(0, 8);
    const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;

    return (
        <>
            <Head title="Dashboard" />
            <AppShell
                title="Dashboard"
                description="Operational overview across beds, patients, documents, and rooms."
            >
                {/* Row 1: Stat Cards */}
                <StatCards beds={beds} patients={patients} notifications={notifications} />

                {/* Row 2: Bed Status Chart + Bed Overview */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <BedStatusChart beds={beds} />

                    <section className="card p-4 xl:col-span-2">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="text-lg font-bold">Bed Overview</h3>
                                    <p className="text-sm text-[var(--text-subtle)]">Current status per bed</p>
                                </div>
                                <span className="badge border-transparent bg-status-occupied text-status-occupied text-xs">
                                    {occupiedBeds}/{beds.length} occupied
                                </span>
                            </div>
                            <Link href="/beds" className="btn-link">
                                Open Beds
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {recentBeds.map((bed) => {
                                const status = bedStatusMeta[bed.status];
                                const patient = bed.patients?.[0];
                                const stayProgress = getStayProgress(patient);

                                return (
                                    <article
                                        key={bed.id}
                                        className={`bed-card p-3 status-border-${bed.status}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {bed.status === 'occupied' && <span className="pulse-dot" style={{ width: 8, height: 8, marginRight: 4 }} />}
                                                <p className="text-sm font-bold text-[var(--text-strong)]">Bed {bed.bed_number}</p>
                                            </div>
                                            <span className={`badge border-transparent ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-[var(--text-subtle)]">
                                            {bed.room?.name ?? 'No room'}
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            {(bed.patients?.length ?? 0) > 0
                                                ? bed.patients!.map((p) => `${p.first_name} ${p.last_name}`).join(', ')
                                                : 'No intake assigned'}
                                        </p>
                                        {stayProgress !== null && (
                                            <div className="progress-track mt-2">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${stayProgress}%`, background: 'var(--status-occupied-fg)' }}
                                                />
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                            {recentBeds.length === 0 && (
                                <p className="col-span-full py-8 text-center text-sm text-[var(--text-subtle)]">
                                    No beds configured yet.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Row 3: Notifications + Activity Chart */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <NotificationList notifications={recentNotifications} compact />
                    <NotificationActivityChart notifications={notifications} />
                </div>

                {/* Row 4: Patients, Documents, Rooms */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <RecentPatientsCard patients={patients} />
                    <RecentDocumentsCard documents={documents} />
                    <RoomOccupancyCard rooms={rooms} beds={beds} />
                </div>
            </AppShell>
        </>
    );
}

function getStayProgress(patient?: Patient): number | null {
    if (!patient?.intake_date || !patient?.discharge_date) return null;
    const start = new Date(patient.intake_date).getTime();
    const end = new Date(patient.discharge_date).getTime();
    const now = Date.now();
    if (end <= start) return null;
    const pct = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
    return pct;
}
