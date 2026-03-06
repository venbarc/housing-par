import { useForm } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Facility } from '../../types';

interface Props {
    facilities: Facility[];
}

export default function PatientsImportTab({ facilities }: Props) {
    const form = useForm<{
        facility_id: number | '';
        file: File | null;
    }>({
        facility_id: facilities.length === 1 ? facilities[0].id : '',
        file: null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!form.data.file) {
            toast.error('Please select a CSV file.');
            return;
        }
        form.post('/import/patients', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset('file'),
            onError: (errors) =>
                toast.error(String(Object.values(errors)[0] ?? 'Import failed.')),
        });
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Patients Import</h3>
                    <p className="text-sm text-[var(--text-subtle)]">
                        Upload a CSV with columns: first_name, last_name, dob, status,
                        referral_from, insurance, intake_date
                    </p>
                </div>
                <a
                    href="/import/template/patients"
                    className="btn-secondary inline-flex items-center gap-1"
                >
                    <Download className="h-4 w-4" />
                    Download Template
                </a>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="field-label">Location</label>
                    <select
                        className="form-select"
                        value={form.data.facility_id}
                        onChange={(e) =>
                            form.setData('facility_id', Number(e.target.value))
                        }
                        required
                    >
                        <option value="">Select location</option>
                        {facilities.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                    {form.errors.facility_id && (
                        <p className="mt-1 text-sm text-red-600">{form.errors.facility_id}</p>
                    )}
                </div>

                <div>
                    <label className="field-label">CSV File</label>
                    <input
                        className="form-input"
                        type="file"
                        accept=".csv,.txt"
                        onChange={(e) =>
                            form.setData('file', e.target.files?.[0] ?? null)
                        }
                    />
                    {form.errors.file && (
                        <p className="mt-1 text-sm text-red-600">{form.errors.file}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={form.processing}
                >
                    {form.processing ? 'Importing...' : 'Import Patients'}
                </button>
            </form>
        </div>
    );
}
