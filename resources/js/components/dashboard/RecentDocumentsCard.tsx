import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { File, FileText } from 'lucide-react';
import { Document } from '../../types';

interface Props {
    documents: Document[];
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileAccent(fileType: string): string {
    const t = fileType.toLowerCase();
    if (t.includes('pdf')) return 'var(--status-maintenance-fg)';
    if (t.includes('word') || t.includes('doc')) return 'var(--status-occupied-fg)';
    if (t.includes('image') || t.includes('png') || t.includes('jpg') || t.includes('jpeg')) return 'var(--status-available-fg)';
    return 'var(--text-subtle)';
}

export default function RecentDocumentsCard({ documents }: Props) {
    const recent = documents.slice(0, 5);

    return (
        <section className="card p-4">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Documents</h3>
                    <p className="text-sm text-[var(--text-subtle)]">{documents.length} uploaded files</p>
                </div>
                <Link href="/documents" className="btn-link">Open</Link>
            </div>

            <ul className="space-y-2">
                {recent.map((doc) => (
                    <li key={doc.id} className="surface-subtle flex items-center gap-3 p-2.5">
                        <span
                            className="shrink-0 rounded-lg p-1.5"
                            style={{ background: `color-mix(in srgb, ${getFileAccent(doc.file_type)} 14%, transparent)`, color: getFileAccent(doc.file_type) }}
                        >
                            {doc.file_type?.toLowerCase().includes('pdf') ? (
                                <FileText className="h-4 w-4" />
                            ) : (
                                <File className="h-4 w-4" />
                            )}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[var(--text-strong)]">{doc.file_name}</p>
                            <p className="text-xs text-[var(--text-subtle)]">
                                {formatSize(doc.file_size)} &middot; {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                            </p>
                        </div>
                    </li>
                ))}
                {recent.length === 0 && (
                    <li className="text-sm text-[var(--text-subtle)]">No documents uploaded yet.</li>
                )}
            </ul>
        </section>
    );
}
