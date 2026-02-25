import { Ward } from '../../types';

interface Props {
    wards: Ward[];
    onEdit?: (ward: Ward) => void;
    editingId?: number | null;
}

export default function WardPanel({ wards, onEdit, editingId }: Props) {
    return (
        <section className="card p-4" id="wards">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Wards</h3>
                    <p className="text-sm text-[var(--text-subtle)]">Location and unit metadata</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                    {wards.length} wards
                </span>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {wards.map((ward) => (
                    <article
                        key={ward.id}
                        className={`surface-subtle p-3 ${editingId === ward.id ? 'ring-2 ring-blue-400/60' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold text-[var(--text-strong)]">{ward.name}</p>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Floor {ward.floor ?? 'N/A'} - {ward.description ?? 'No description'}
                                </p>
                            </div>

                            {onEdit && (
                                <button
                                    type="button"
                                    onClick={() => onEdit(ward)}
                                    className="btn-secondary px-3 py-1 text-xs"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </article>
                ))}
                {wards.length === 0 && (
                    <p className="py-4 text-sm text-[var(--text-subtle)]">No wards yet.</p>
                )}
            </div>
        </section>
    );
}
