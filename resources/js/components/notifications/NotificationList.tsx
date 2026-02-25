import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Notification } from '../../types';

interface Props {
    notifications: Notification[];
    compact?: boolean;
}

export default function NotificationList({ notifications, compact = false }: Props) {
    const markRead = (id: number) => {
        router.patch(`/notifications/${id}/read`, {}, {
            preserveScroll: true,
            onError: () => toast.error('Could not mark notification as read.'),
        });
    };

    const remove = (id: number) => {
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            onError: () => toast.error('Could not delete notification.'),
        });
    };

    return (
        <section className="card p-4" id="notifications">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Notifications</h3>
                    <p className="text-sm text-[var(--text-subtle)]">Recent activity log</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                    {notifications.length} events
                </span>
            </div>

            <div className={`space-y-2 ${compact ? 'max-h-[356px]' : 'max-h-[540px]'} overflow-y-auto pr-1`}>
                {notifications.map((notification) => (
                    <article key={notification.id} className="surface-subtle p-3">
                        <p className="text-sm text-[var(--text-strong)]">{notification.message}</p>
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-[var(--text-subtle)]">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                            <div className="flex items-center gap-2">
                                {!notification.is_read && (
                                    <button onClick={() => markRead(notification.id)} className="btn-link text-xs">
                                        Mark read
                                    </button>
                                )}
                                <button onClick={() => remove(notification.id)} className="text-xs font-semibold text-[var(--text-subtle)] hover:text-[var(--text-strong)]">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
                {notifications.length === 0 && (
                    <p className="py-4 text-center text-sm text-[var(--text-subtle)]">No notifications yet.</p>
                )}
            </div>
        </section>
    );
}
