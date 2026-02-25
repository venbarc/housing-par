import { Link, usePage } from '@inertiajs/react';
import { navItems } from './nav-items';
import { PageProps } from '../../types';
import { cn } from '../../lib/utils';
import LogoMark from './LogoMark';

function isActivePath(url: string, href: string, exact = false): boolean {
    const path = url.split('?')[0];
    if (exact) return path === href;
    return path === href || path.startsWith(`${href}/`);
}

export default function Sidebar() {
    const { url, props } = usePage<PageProps>();
    const unread = props.auth.unread_notifications ?? 0;

    return (
        <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-6 space-y-4">
                <div className="card px-4 py-5">
                    <LogoMark variant="full" />
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-subtle)' }}>
                        Capacity, patients, and documents in one workspace.
                    </p>
                </div>

                <nav className="card p-3">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActivePath(url, item.href, item.exact);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn('nav-link', active && 'active')}
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </span>
                                        {item.href === '/notifications' && unread > 0 && (
                                            <span className="badge text-xs">{unread}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
