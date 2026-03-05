import { Bell, BedDouble, ClipboardList, LayoutDashboard, Users, Building2, BarChart3 } from 'lucide-react';

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
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/facilities', label: 'Name', icon: Building2 },
];
