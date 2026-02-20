import { Bed, Activity, FileText, Users } from "lucide-react";
import { Bed as BedType, NotificationRecord, Patient } from "../../types";
import { bedStatusMeta } from "../../lib/status";

type Props = {
  beds: BedType[];
  patients: Patient[];
  notifications: NotificationRecord[];
};

export default function StatCards({ beds, patients, notifications }: Props) {
  const occupied = beds.filter((b) => b.status === "occupied").length;
  const available = beds.filter((b) => b.status === "available").length;
  const critical = patients.filter((p) => p.status === "critical").length;
  const unread = notifications.filter((n) => !n.isRead).length;

  const cards = [
    {
      label: "Beds",
      value: `${occupied}/${beds.length}`,
      sub: `${available} available`,
      icon: Bed,
      color: "text-primary-600",
    },
    {
      label: "Patients",
      value: patients.length.toString(),
      sub: `${critical} critical`,
      icon: Users,
      color: "text-teal-600",
    },
    {
      label: "Activity",
      value: `${notifications.length}`,
      sub: `${unread} unread`,
      icon: Activity,
      color: "text-amber-600",
    },
    {
      label: "Statuses",
      value: Object.values(bedStatusMeta)
        .map((s) => s.label[0])
        .join(" "),
      sub: "Live updates",
      icon: FileText,
      color: "text-slate-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{sub}</p>
          </div>
          <div className={`h-12 w-12 grid place-items-center rounded-lg bg-slate-50 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      ))}
    </div>
  );
}
