import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Bed, Patient } from '../../types';

interface Props {
    beds: Bed[];
}

export default function PatientCreateForm({ beds }: Props) {
    const availableBeds = beds.filter((bed) => !bed.patient_id);
    const form = useForm({
        name: '',
        age: 50,
        gender: 'N/A',
        diagnosis: '',
        status: 'stable' as Patient['status'],
        doctor: '',
        admission_date: new Date().toISOString().slice(0, 10),
        contact: '',
        notes: '',
        bed_id: null as number | null,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/patients', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not create patient.')),
        });
    };

    return (
        <form onSubmit={submit} className="card p-4">
            <div className="mb-3">
                <h3 className="text-lg font-bold">Admit Patient</h3>
                <p className="text-sm text-slate-500">Create a patient record and optional bed assignment</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="field-label">Full Name</label>
                    <input className="form-input" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                </div>
                <div>
                    <label className="field-label">Age</label>
                    <input
                        type="number"
                        className="form-input"
                        value={form.data.age}
                        onChange={(event) => form.setData('age', Number(event.target.value))}
                        required
                    />
                </div>
                <div>
                    <label className="field-label">Gender</label>
                    <input className="form-input" value={form.data.gender} onChange={(event) => form.setData('gender', event.target.value)} required />
                </div>
                <div>
                    <label className="field-label">Status</label>
                    <select
                        className="form-select"
                        value={form.data.status}
                        onChange={(event) => form.setData('status', event.target.value as Patient['status'])}
                    >
                        {(['stable', 'critical', 'recovering', 'discharged'] as const).map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="field-label">Diagnosis</label>
                    <input className="form-input" value={form.data.diagnosis} onChange={(event) => form.setData('diagnosis', event.target.value)} required />
                </div>
                <div>
                    <label className="field-label">Doctor</label>
                    <input className="form-input" value={form.data.doctor} onChange={(event) => form.setData('doctor', event.target.value)} required />
                </div>
                <div>
                    <label className="field-label">Admission Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={form.data.admission_date}
                        onChange={(event) => form.setData('admission_date', event.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="field-label">Contact</label>
                    <input className="form-input" value={form.data.contact} onChange={(event) => form.setData('contact', event.target.value)} required />
                </div>
                <div className="sm:col-span-2">
                    <label className="field-label">Assign Bed (optional)</label>
                    <select
                        className="form-select"
                        value={form.data.bed_id ?? ''}
                        onChange={(event) => form.setData('bed_id', event.target.value ? Number(event.target.value) : null)}
                    >
                        <option value="">No bed yet</option>
                        {availableBeds.map((bed) => (
                            <option key={bed.id} value={bed.id}>
                                Bed {bed.bed_number} ({bed.status})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="field-label">Notes</label>
                    <textarea
                        className="form-textarea"
                        value={form.data.notes}
                        onChange={(event) => form.setData('notes', event.target.value)}
                    />
                </div>
            </div>

            <button type="submit" className="btn-primary mt-4 w-full" disabled={form.processing}>
                {form.processing ? 'Saving...' : 'Save Patient'}
            </button>
        </form>
    );
}
