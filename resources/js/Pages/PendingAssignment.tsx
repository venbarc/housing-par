import { Head, router, usePage } from '@inertiajs/react';
import AppShell from '../components/layout/AppShell';
import { PageProps } from '../types';

export default function PendingAssignment() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const locationName = user?.facility?.name ?? (user?.facility_id ? `Location #${user.facility_id}` : 'Unassigned');

    return (
        <>
            <Head title="Pending Assignment" />
            <AppShell title="Pending Assignment" description="Your account needs admin allocation (Location access) before you can use the app.">
                <section className="card p-4">
                    <h3 className="text-lg font-bold text-[color:var(--text-strong)]">Waiting for admin allocation</h3>
                    <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                        {user ? (
                            <>
                                Signed in as <span className="font-semibold">{user.name}</span> ({user.email}).
                                <span className="ml-2">Location: {locationName}.</span>
                            </>
                        ) : (
                            'You are signed in.'
                        )}
                    </p>
                    <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                        Please contact an administrator to assign your Location.
                    </p>

                    <div className="mt-4">
                        <button type="button" className="btn-secondary" onClick={() => router.post('/logout')}>
                            Log out
                        </button>
                    </div>
                </section>
            </AppShell>
        </>
    );
}
