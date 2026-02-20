"use client";

import { useMemo } from "react";
import { Bell, Search } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { NotificationRecord } from "../../types";
import { withToast } from "../../lib/client-api";
import toast from "react-hot-toast";

export default function Topbar() {
  const { data: notifications } = useCollection<NotificationRecord>("notifications");

  const unread = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markAllRead = async () => {
    if (notifications.length === 0) return;
    await Promise.all(
      notifications
        .filter((n) => !n.isRead)
        .map((n) =>
          fetch(`/api/notifications/${n.id}`, {
            method: "PATCH",
          })
        )
    );
    toast.success("Notifications cleared");
  };

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
            onClick={() => withToast(markAllRead(), "Notifications marked read")}
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
              NR
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Nurse</p>
              <p className="text-xs text-slate-500">Role: Staff</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
