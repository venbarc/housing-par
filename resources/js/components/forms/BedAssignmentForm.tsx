import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { Bed, Patient } from '../../types';

interface Props {
    beds: Bed[];
    patients: Patient[];
}

export default function BedAssignmentForm({ beds, patients }: Props) {
    const [bedId, setBedId] = useState('');
    const [patientId, setPatientId] = useState('');

    const assign = (event: FormEvent) => {
        event.preventDefault();
        if (!bedId || !patientId) {
            toast.error('Select both a bed and a patient.');
            return;
        }

        router.post(`/beds/${bedId}/assign`, { patient_id: Number(patientId) }, {
            preserveScroll: true,
            onSuccess: () => {
                setBedId('');
                setPatientId('');
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not assign patient.')),
        });
    };

    const discharge = () => {
        if (!bedId) return;
        router.post(`/beds/${bedId}/discharge`, {}, {
            preserveScroll: true,
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not discharge patient.')),
        });
    };

    const availableBeds = beds.filter((b) => b.status === 'available' || b.status === 'cleaning');
    const availablePatients = patients.filter((p) => !p.bed_id);

    return (
        <form onSubmit={assign} className="card p-4">
            <div className="mb-3">
                <h3 className="text-lg font-bold">Assign Patient</h3>
                <p className="text-sm text-slate-500">Link a patient to an available bed</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="field-label">Bed</label>
                    <select
                        className="form-select"
                        value={bedId}
                        onChange={(event) => setBedId(event.target.value)}
                        required
                    >
                        <option value="">Select bed</option>
                        {availableBeds.map((bed) => (
                            <option key={bed.id} value={bed.id}>
                                Bed {bed.bed_number} ({bed.status})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="field-label">Patient</label>
                    <select
                        className="form-select"
                        value={patientId}
                        onChange={(event) => setPatientId(event.target.value)}
                        required
                    >
                        <option value="">Select patient</option>
                        {availablePatients.map((patient) => (
                            <option key={patient.id} value={patient.id}>{patient.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <button type="submit" className="btn-primary w-full">Assign</button>
                <button type="button" className="btn-secondary w-full" onClick={discharge} disabled={!bedId}>
                    Discharge
                </button>
            </div>
        </form>
    );
}
