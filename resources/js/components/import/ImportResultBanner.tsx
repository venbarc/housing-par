import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ImportResult } from '../../types';

interface Props {
    result: ImportResult;
}

export default function ImportResultBanner({ result }: Props) {
    return (
        <div
            className={`card mb-4 border-l-4 p-4 ${result.success ? 'border-l-green-500' : 'border-l-red-500'}`}
        >
            <div className="flex items-start gap-3">
                {result.success ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                )}
                <div className="min-w-0">
                    <p className="font-semibold">{result.message}</p>

                    {result.errors.length > 0 && (
                        <div className="mt-2">
                            <p className="mb-1 flex items-center gap-1 text-sm font-medium text-[var(--text-subtle)]">
                                <AlertTriangle className="h-4 w-4" />
                                {result.errors.length} error(s) found:
                            </p>
                            <ul className="max-h-48 list-inside list-disc space-y-0.5 overflow-y-auto text-sm text-red-600">
                                {result.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
