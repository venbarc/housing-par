import { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '../../types';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { cn } from '../../lib/utils';
import { navItems } from './nav-items';

interface Props {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}

function isActivePath(url: string, href: string, exact = false): boolean {
    const path = url.split('?')[0];
    if (exact) return path === href;
    return path === href || path.startsWith(`${href}/`);
}

export default function AppShell({ title, description, actions, children }: Props) {
    const { url, props } = usePage<PageProps>();
    const unread = props.auth.unread_notifications ?? 0;

    return (
        <div className="min-h-screen pb-20 lg:pb-6">
            <div className="page-shell">
                <div className="flex gap-6">
                    <Sidebar />
                    <main className="min-w-0 flex-1">
                        <Topbar title={title} description={description} actions={actions} />
                        <div className="space-y-4 sm:space-y-5">{children}</div>
                    </main>
                </div>
            </div>

            <nav className="mobile-nav fixed inset-x-0 bottom-0 z-50 px-2 py-2 lg:hidden">
                <ul className="grid grid-cols-6 gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActivePath(url, item.href, item.exact);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'relative flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold',
                                        active
                                            ? 'bg-[color:var(--surface-strong)] text-[color:var(--text-strong)]'
                                            : 'text-[color:var(--text-muted)]'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                    {item.href === '/notifications' && unread > 0 && (
                                        <span className="absolute right-2 top-1 h-2.5 w-2.5 rounded-full bg-primary-600" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
