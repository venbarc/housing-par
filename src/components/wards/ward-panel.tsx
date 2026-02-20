"use client";

import { Ward } from "../../types";

type Props = { wards: Ward[] };

export default function WardPanel({ wards }: Props) {
  return (
    <div className="card p-4" id="wards">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-800">Wards</p>
          <p className="text-sm text-slate-500">Ward / Room overview</p>
        </div>
        <span className="text-xs text-slate-500">{wards.length} wards</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {wards.map((w) => (
          <div
            key={w.id}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-soft"
          >
            <p className="font-medium text-slate-800">{w.name}</p>
            <p className="text-xs text-slate-500">
              Floor: {w.floor || "N/A"} • {w.description || "No description"}
            </p>
          </div>
        ))}
        {wards.length === 0 && (
          <p className="text-sm text-slate-500">No wards yet. Create via API or seed script.</p>
        )}
      </div>
    </div>
  );
}
