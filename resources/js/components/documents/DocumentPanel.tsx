import { router } from '@inertiajs/react';
import { Document, Patient } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Props {
    documents: Document[];
    patients: Patient[];
}

export default function DocumentPanel({ documents, patients }: Props) {
    const patientName = (id: number) => patients.find((p) => p.id === id)?.name ?? 'Unknown';

    const remove = (id: number) => {
        router.delete(`/documents/${id}`, {
            onError: () => toast.error('Failed to delete'),
        });
    };

    return (
        <div className="card p-4" id="documents">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="font-semibold text-slate-800">Documents</p>
                    <p className="text-sm text-slate-500">Attachments</p>
                </div>
                <span className="text-xs text-slate-500">{documents.length} files</span>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div>
                            <p className="text-sm font-medium text-slate-800">{doc.file_name}</p>
                            <p className="text-xs text-slate-500">
                                {patientName(doc.patient_id)} &bull; {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">
                                Download
                            </a>
                            <button onClick={() => remove(doc.id)} className="text-xs text-slate-500 hover:underline">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {documents.length === 0 && <p className="text-sm text-slate-500">No documents yet.</p>}
            </div>
        </div>
    );
}
