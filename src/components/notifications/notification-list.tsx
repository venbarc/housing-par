"use client";

import { NotificationRecord } from "../../types";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

type Props = {
  notifications: NotificationRecord[];
};

export default function NotificationList({ notifications }: Props) {
  const markRead = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    if (!res.ok) toast.error("Failed to mark read");
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (!res.ok) toast.error("Failed to delete");
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
          <div
            key={n.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <div>
              <p className="text-sm text-slate-800">{n.message}</p>
              <p className="text-xs text-slate-500">
                {formatDistanceToNow(n.createdAt, { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!n.isRead && (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => remove(n.id)}
                className="text-xs text-slate-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="text-sm text-slate-500">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
