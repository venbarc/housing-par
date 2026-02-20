import { router } from '@inertiajs/react';
import { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Props { notifications: Notification[] }

export default function NotificationList({ notifications }: Props) {
    const markRead = (id: number) => {
        router.patch(`/notifications/${id}/read`, {}, {
            onError: () => toast.error('Failed to mark read'),
        });
    };

    const remove = (id: number) => {
        router.delete(`/notifications/${id}`, {
            onError: () => toast.error('Failed to delete'),
        });
    };

    return (
        <div className="card p-4" id="notifications">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="font-semibold text-slate-800">Notifications</p>
                    <p className="text-sm text-slate-500">Activity log</p>
                </div>
                <span className="text-xs text-slate-500">{notifications.length} events</span>
            </div>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                    <div key={n.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div>
                            <p className="text-sm text-slate-800">{n.message}</p>
                            <p className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {!n.is_read && (
                                <button onClick={() => markRead(n.id)} className="text-xs text-primary-600 hover:underline">
                                    Mark read
                                </button>
                            )}
                            <button onClick={() => remove(n.id)} className="text-xs text-slate-500 hover:underline">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications yet.</p>}
            </div>
        </div>
    );
}
