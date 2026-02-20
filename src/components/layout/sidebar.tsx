"use client";

import Link from "next/link";
import { Bed, FileText, LayoutDashboard, Bell, Users, Map } from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "#patients", label: "Patients", icon: Users },
  { href: "#documents", label: "Documents", icon: FileText },
  { href: "#notifications", label: "Notifications", icon: Bell },
  { href: "#wards", label: "Wards", icon: Map },
  { href: "#beds", label: "Beds", icon: Bed },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 flex-col gap-4 p-4">
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-700 grid place-items-center font-bold">
            HB
          </div>
          <div>
            <p className="text-sm text-slate-500">Hospital</p>
            <p className="font-semibold text-slate-800">Bed Manager</p>
          </div>
        </div>
      </div>
      <nav className="card p-2">
        <ul className="flex flex-col gap-1">
          {links.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="card p-4 bg-gradient-to-br from-primary-50 to-teal-50">
        <p className="text-sm text-slate-600">
          Track beds, patients, documents, and notifications in real time.
        </p>
      </div>
    </aside>
  );
}
