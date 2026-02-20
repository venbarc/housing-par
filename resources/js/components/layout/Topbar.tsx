import { useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Bell, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Notification, PageProps } from '../../types';

interface Props {
    notifications: Notification[];
}

export default function Topbar({ notifications }: Props) {
    const { auth } = usePage<PageProps>().props;
    const unread = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

    const markAllRead = () => {
        if (unread === 0) return;
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Notifications cleared'),
            onError: () => toast.error('Failed'),
        });
    };

    const initials = auth.user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 bg-white shadow-soft">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Search patients, beds..."
                            className="outline-none text-sm bg-transparent"
                            aria-label="search"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllRead}
                        className="relative rounded-full bg-primary-50 text-primary-700 p-2 hover:bg-primary-100 transition"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-red-500 text-white text-xs grid place-items-center px-1">
                                {unread}
                            </span>
                        )}
                    </button>
                    <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 shadow-soft">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 grid place-items-center font-semibold">
                            {initials}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{auth.user.name}</p>
                            <p className="text-xs text-slate-500">Staff</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
