import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import NotificationList from '../../components/notifications/NotificationList';
import { Notification, PageProps } from '../../types';

interface Props extends PageProps {
    notifications: Notification[];
}

export default function NotificationsIndex({ notifications }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['notifications'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Notifications" />
            <AppShell
                title="Notifications"
                description="Read and clear the activity feed"
                actions={(
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => router.post('/notifications/mark-all-read', {}, { preserveScroll: true })}
                    >
                        Mark all read
                    </button>
                )}
            >
                <NotificationList notifications={notifications} />
            </AppShell>
        </>
    );
}
