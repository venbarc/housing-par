import { format } from 'date-fns';
import { patientStatusMeta } from '../../lib/status';
import { Bed, Patient } from '../../types';

interface Props {
    patients: Patient[];
    onDischarge?: (bed: Bed, patient: Patient) => void;
}

export default function PatientTable({ patients, onDischarge }: Props) {
    return (
        <section className="card p-4" id="patients">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Patients</h3>
                    <p className="text-sm text-slate-500">Intake records and bed assignment</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {patients.length} records
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="table-head border-b border-slate-200">
                            <th className="py-2 text-left">First Name</th>
                            <th className="text-left">Last Name</th>
                            <th className="text-left">DOB</th>
                            <th className="text-left">Status</th>
                            <th className="text-left">Referral From</th>
                            <th className="text-left">Insurance</th>
                            <th className="text-left">Bed</th>
                            <th className="text-left">Intake Date</th>
                            <th className="text-left">Discharge Date</th>
                            <th className="text-left">Discharged At</th>
                            <th className="text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => {
                            const status = patientStatusMeta[patient.status];
                            return (
                                <tr key={patient.id} className="border-b border-slate-100 last:border-b-0">
                                    <td className="table-cell">{patient.first_name}</td>
                                    <td className="table-cell">{patient.last_name}</td>
                                    <td className="table-cell">
                                        {patient.dob ? format(new Date(patient.dob), 'MM/dd/yyyy') : '-'}
                                    </td>
                                    <td className="table-cell">
                                        <span className={`badge border-transparent ${status.bg} ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        {patient.referral_from ?? '-'}
                                    </td>
                                    <td className="table-cell">
                                        {patient.insurance ?? '-'}
                                    </td>
                                    <td className="table-cell">
                                        {patient.bed
                                            ? `${patient.bed.room?.name ?? 'Rm ?'} • ${patient.bed.bed_number}`
                                            : patient.bed_id ?? '-'}
                                    </td>
                                    <td className="table-cell">
                                        {patient.intake_date ? format(new Date(patient.intake_date), 'MM/dd/yyyy') : '-'}
                                    </td>
                                    <td className="table-cell">
                                        {patient.discharge_date ? format(new Date(patient.discharge_date), 'MM/dd/yyyy') : '-'}
                                    </td>
                                    <td className="table-cell">
                                        {patient.discharged_at ? format(new Date(patient.discharged_at), 'MM/dd/yyyy') : '-'}
                                    </td>
                                    <td className="table-cell">
                                        {patient.bed_id && patient.bed ? (
                                            <button
                                                className="btn-link text-xs"
                                                onClick={() => onDischarge?.(patient.bed!, patient)}
                                            >
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
