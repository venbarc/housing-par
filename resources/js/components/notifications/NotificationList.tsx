import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, BedDouble, Calendar, FileText, UserPlus } from 'lucide-react';
import { Notification, NotificationType } from '../../types';

interface Props {
    notifications: Notification[];
    compact?: boolean;
}

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
    admission: UserPlus,
    bed_occupied: BedDouble,
    bed_vacated: BedDouble,
    critical: AlertTriangle,
    doc_uploaded: FileText,
    upcoming_discharge: Calendar,
};

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
                <AnimatePresence initial={false}>
                    {notifications.map((notification) => {
                        const Icon = TYPE_ICON[notification.type] ?? FileText;
                        return (
                            <motion.article
                                key={notification.id}
                                layout
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`surface-subtle p-3 notif-border-${notification.type} ${
                                    !notification.is_read ? 'bg-[var(--surface-strong)]' : ''
                                }`}
                            >
                                <div className="flex items-start gap-2.5">
                                    <span className="mt-0.5 shrink-0 text-[var(--text-subtle)]">
                                        <Icon className="h-3.5 w-3.5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm ${!notification.is_read ? 'font-semibold text-[var(--text-strong)]' : 'text-[var(--text-strong)]'}`}>
                                            {notification.message}
                                        </p>
                                        <div className="mt-1.5 flex items-center justify-between">
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
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </AnimatePresence>
                {notifications.length === 0 && (
                    <p className="py-4 text-center text-sm text-[var(--text-subtle)]">No notifications yet.</p>
                )}
            </div>
        </section>
    );
}
