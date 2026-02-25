import { Bell, BedDouble, ClipboardList, LayoutDashboard, Users, Building2 } from 'lucide-react';

export interface NavItem {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    exact?: boolean;
}

export const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/beds', label: 'Beds', icon: BedDouble },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/documents', label: 'Documents', icon: ClipboardList },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/wards', label: 'Wards', icon: Building2 },
];
