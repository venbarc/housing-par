import { Bell, BedDouble, ClipboardList, LayoutDashboard, Users, Building2, BarChart3, Shield, ClipboardCheck, FolderKanban, UserCircle2 } from 'lucide-react';
import { User } from '../../types';

export interface NavItem {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    exact?: boolean;
}

const baseNavItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/beds', label: 'Beds', icon: BedDouble },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/documents', label: 'Documents', icon: ClipboardList },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/discharges', label: 'Discharges', icon: ClipboardCheck },
    { href: '/notifications', label: 'Notifications', icon: Bell },
];

const adminNavItems: NavItem[] = [
    { href: '/facilities', label: 'Locations', icon: Building2 },
    { href: '/admin/users', label: 'Admin Users', icon: Shield },
    { href: '/admin/programs', label: 'Programs', icon: FolderKanban },
    { href: '/admin/audit-logs', label: 'Audit Trail', icon: ClipboardCheck },
];

export function getNavItems(user: User | null): NavItem[] {
    if (!user) {
        return [];
    }

    const hasPrograms = (user.program_ids?.length ?? 0) > 0 || !!user.program_id;
    if (!user.is_admin && (!user.facility_id || !hasPrograms)) {
        return [{ href: '/pending-assignment', label: 'Account', icon: UserCircle2 }];
    }

    if (user.is_admin) {
        return [...baseNavItems, ...adminNavItems];
    }

    return baseNavItems;
}
