import { useForm } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Facility, Program } from '../../types';

interface Props {
    facilities: Facility[];
    programs: Program[];
}

export default function RoomsBedsImportTab({ facilities, programs }: Props) {
    const form = useForm<{
        facility_id: number | '';
        program_id: number | '';
        file: File | null;
    }>({
        facility_id: facilities.length === 1 ? facilities[0].id : '',
        program_id: programs.length === 1 ? programs[0].id : '',
        file: null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!form.data.file) {
            toast.error('Please select a CSV file.');
            return;
        }
        form.post('/import/rooms-beds', {
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
                    <h3 className="text-lg font-bold">Rooms & Beds Import</h3>
                    <p className="text-sm text-[var(--text-subtle)]">
                        Upload a CSV with columns: room_name, bed_number, bed_type
                    </p>
                </div>
                <a
                    href="/import/template/rooms-beds"
                    className="btn-secondary inline-flex items-center gap-1"
                >
                    <Download className="h-4 w-4" />
                    Download Template
                </a>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                        <label className="field-label">Program</label>
                        <select
                            className="form-select"
                            value={form.data.program_id}
                            onChange={(e) =>
                                form.setData('program_id', Number(e.target.value))
                            }
                            required
                        >
                            <option value="">Select program</option>
                            {programs.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.program_id && (
                            <p className="mt-1 text-sm text-red-600">{form.errors.program_id}</p>
                        )}
                    </div>
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
                    {form.processing ? 'Importing...' : 'Import Rooms & Beds'}
                </button>
            </form>
        </div>
    );
}
