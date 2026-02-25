import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { patientStatusMeta } from '../../lib/status';
import { Patient } from '../../types';

interface Props {
    patients: Patient[];
}

export default function PatientTable({ patients }: Props) {
    const discharge = (bedId: number) => {
        router.post(`/beds/${bedId}/discharge`, {}, {
            preserveScroll: true,
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Failed to discharge patient.')),
        });
    };

    return (
        <section className="card p-4" id="patients">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Patients</h3>
                    <p className="text-sm text-slate-500">Clinical status and assignment</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {patients.length} records
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="table-head border-b border-slate-200">
                            <th className="py-2 text-left">Name</th>
                            <th className="text-left">Doctor</th>
                            <th className="text-left">Status</th>
                            <th className="text-left">Bed</th>
                            <th className="text-left">Admitted</th>
                            <th className="text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => {
                            const status = patientStatusMeta[patient.status];
                            return (
                                <tr key={patient.id} className="border-b border-slate-100 last:border-b-0">
                                    <td className="table-cell">
                                        <p className="font-semibold text-slate-800">{patient.name}</p>
                                        <p className="text-xs text-slate-500">{patient.diagnosis}</p>
                                    </td>
                                    <td className="table-cell">{patient.doctor}</td>
                                    <td className="table-cell">
                                        <span className={`badge border-transparent ${status.bg} ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="table-cell">{patient.bed_id ?? '-'}</td>
                                    <td className="table-cell">
                                        {patient.admission_date ? format(new Date(patient.admission_date), 'MMM d, yyyy') : '-'}
                                    </td>
                                    <td className="table-cell">
                                        {patient.bed_id ? (
                                            <button className="btn-link text-xs" onClick={() => discharge(patient.bed_id!)}>
                                                Discharge
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400">No bed</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
