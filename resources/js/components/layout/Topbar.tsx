import { ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, LogOut } from 'lucide-react';
import { PageProps } from '../../types';
import ThemeToggle from './ThemeToggle';
import LogoMark from './LogoMark';

interface Props {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export default function Topbar({ title, description, actions }: Props) {
    const { auth } = usePage<PageProps>().props;
    const unread = auth.unread_notifications ?? 0;
    const user = auth.user;

    return (
        <header className="card mb-4 px-4 py-3 sm:mb-5 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <LogoMark variant="icon" />
                    <div>
                        <h2 className="text-2xl font-extrabold">{title}</h2>
                        {description && <p className="mt-1 text-sm" style={{ color: 'var(--text-subtle)' }}>{description}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    {actions}
                    <Link href="/notifications" className="btn-secondary relative p-2.5" aria-label="Notifications">
                        <Bell className="h-4 w-4" />
                        {unread > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-primary-600 px-1 text-[11px] font-bold text-white">
                                {unread}
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => router.post('/logout')}
                        className="btn-secondary p-2.5"
                        aria-label="Log out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {user && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Signed in as {user.name}
                </p>
            )}
        </header>
    );
}
