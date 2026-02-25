import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Patient } from '../../types';

interface Props {
    patients: Patient[];
}

export default function DocumentUploadForm({ patients }: Props) {
    const form = useForm<{ patient_id: string; file: File | null }>({
        patient_id: '',
        file: null,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!form.data.file || !form.data.patient_id) {
            toast.error('Select a patient and a file.');
            return;
        }

        form.post('/documents', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => form.reset(),
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not upload document.')),
        });
    };

    return (
        <form onSubmit={submit} className="card p-4">
            <div className="mb-3">
                <h3 className="text-lg font-bold">Upload Document</h3>
                <p className="text-sm text-slate-500">Attach files to a patient record</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="field-label">Patient</label>
                    <select
                        className="form-select"
                        value={form.data.patient_id}
                        onChange={(event) => form.setData('patient_id', event.target.value)}
                        required
                    >
                        <option value="">Select patient</option>
                        {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>{patient.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="field-label">File</label>
                    <input
                        className="form-input"
                        type="file"
                        onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)}
                        required
                    />
                </div>
            </div>

            <button type="submit" className="btn-primary mt-4 w-full" disabled={form.processing}>
                {form.processing ? 'Uploading...' : 'Upload'}
            </button>
        </form>
    );
}
