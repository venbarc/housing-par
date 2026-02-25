import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Document, Patient } from '../../types';

interface Props {
    documents: Document[];
    patients: Patient[];
}

export default function DocumentPanel({ documents, patients }: Props) {
    const patientDocs = documents.filter((doc) => doc.patient_id);
    const patientName = (id: number) => patients.find((patient) => patient.id === id)?.name ?? 'Unknown patient';

    const remove = (id: number) => {
        router.delete(`/documents/${id}`, {
            preserveScroll: true,
            onError: () => toast.error('Could not delete document.'),
        });
    };

    return (
        <section className="card p-4" id="documents">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Documents</h3>
                    <p className="text-sm text-slate-500">Patient attachments in storage</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {documents.length} files
                </span>
            </div>

            <div className="space-y-2">
                {patientDocs.map((document) => (
                    <article key={document.id} className="surface-subtle p-3">
                        <p className="text-sm font-semibold text-slate-800">{document.file_name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                            {patientName(document.patient_id!)} - {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <a href={document.file_url} target="_blank" rel="noreferrer" className="btn-link text-xs">
                                Download
                            </a>
                            <button className="text-xs font-semibold text-slate-500 hover:text-slate-700" onClick={() => remove(document.id)}>
                                Delete
                            </button>
                        </div>
                    </article>
                ))}
                {patientDocs.length === 0 && (
                    <p className="py-4 text-center text-sm text-slate-500">No documents uploaded yet.</p>
                )}
            </div>
        </section>
    );
}
