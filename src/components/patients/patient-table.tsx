"use client";

import { Patient } from "../../types";
import { patientStatusMeta } from "../../lib/status";
import { format } from "date-fns";
import { api, withToast } from "../../lib/client-api";

type Props = { patients: Patient[] };

export default function PatientTable({ patients }: Props) {
  return (
    <div className="card p-4" id="patients">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-800">Patients</p>
          <p className="text-sm text-slate-500">Profiles</p>
        </div>
        <span className="text-xs text-slate-500">{patients.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Name</th>
              <th>Doctor</th>
              <th>Status</th>
              <th>Bed</th>
              <th>Admitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const status = patientStatusMeta[p.status];
              return (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.diagnosis}</p>
                  </td>
                  <td>{p.doctor}</td>
                  <td>
                    <span className={`badge ${status.bg} ${status.color}`}>{status.label}</span>
                  </td>
                  <td>{p.bedId || "—"}</td>
                  <td>{p.admissionDate ? format(new Date(p.admissionDate), "MMM d") : "—"}</td>
                  <td>
                    {p.bedId && (
                      <button
                        onClick={() => withToast(api.dischargePatient(p.bedId!), "Discharged")}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        Discharge
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {patients.length === 0 && (
          <p className="text-sm text-slate-500 py-3">No patients yet.</p>
        )}
      </div>
    </div>
  );
}
