import { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Bed, Document, Notification, PageProps, Patient, Ward } from '../types';
import AppShell from '../components/layout/AppShell';
import StatCards from '../components/dashboard/StatCards';
import NotificationList from '../components/notifications/NotificationList';
import { bedStatusMeta } from '../lib/status';

interface Props extends PageProps {
    beds: Bed[];
    patients: Patient[];
    wards: Ward[];
    documents: Document[];
    notifications: Notification[];
}

export default function Dashboard({ beds, patients, wards, documents, notifications }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['beds', 'patients', 'documents', 'notifications', 'wards'],
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const recentBeds = beds.slice(0, 8);
    const recentNotifications = notifications.slice(0, 8);
    const recentDocs = documents.slice(0, 5);

    return (
        <>
            <Head title="Dashboard" />
            <AppShell
                title="Dashboard"
                description="Operational overview across beds, patients, documents, and wards."
            >
                <StatCards beds={beds} patients={patients} notifications={notifications} />

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <section className="card p-4 xl:col-span-2">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Bed Overview</h3>
                                <p className="text-sm text-[var(--text-subtle)]">Current status per bed</p>
                            </div>
                            <Link href="/beds" className="btn-link">
                                Open Beds
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {recentBeds.map((bed) => {
                                const status = bedStatusMeta[bed.status];
                                return (
                                    <article key={bed.id} className="surface-subtle p-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-[var(--text-strong)]">Bed {bed.bed_number}</p>
                                            <span className={`badge border-transparent ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-[var(--text-subtle)]">
                                            Ward {bed.ward_id} - Room {bed.room}
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            {bed.patient?.name ?? 'No patient assigned'}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <NotificationList notifications={recentNotifications} compact />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <section className="card p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Patients</h3>
                                <p className="text-sm text-[var(--text-subtle)]">{patients.length} active records</p>
                            </div>
                            <Link href="/patients" className="btn-link">Open</Link>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                            Track admissions, status changes, and discharge workflow.
                        </p>
                    </section>

                    <section className="card p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Documents</h3>
                                <p className="text-sm text-[var(--text-subtle)]">{documents.length} uploaded files</p>
                            </div>
                            <Link href="/documents" className="btn-link">Open</Link>
                        </div>
                        <ul className="space-y-2">
                            {recentDocs.map((doc) => (
                                <li key={doc.id} className="surface-subtle p-2.5 text-sm text-[var(--text-strong)]">
                                    {doc.file_name}
                                </li>
                            ))}
                            {recentDocs.length === 0 && (
                                <li className="text-sm text-[var(--text-subtle)]">No documents uploaded yet.</li>
                            )}
                        </ul>
                    </section>

                    <section className="card p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Wards</h3>
                                <p className="text-sm text-[var(--text-subtle)]">{wards.length} configured wards</p>
                            </div>
                            <Link href="/wards" className="btn-link">Open</Link>
                        </div>
                        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                            {wards.slice(0, 5).map((ward) => (
                                <li key={ward.id} className="surface-subtle p-2.5">
                                    {ward.name} {ward.floor ? `(Floor ${ward.floor})` : ''}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </AppShell>
        </>
    );
}
