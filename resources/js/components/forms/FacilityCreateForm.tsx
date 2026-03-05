import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Facility } from '../../types';

interface Props {
    facility?: Facility | null;
    onDone?: () => void;
}

export default function FacilityCreateForm({ facility, onDone }: Props) {
    const form = useForm({
        name: '',
        notes: '',
    });

    const isEditing = Boolean(facility);

    useEffect(() => {
        if (facility) {
            form.setData('name', facility.name);
            form.setData('notes', facility.notes ?? '');
        } else {
            form.reset();
        }
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facility?.id]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const action = isEditing ? form.patch : form.post;
        const url = isEditing && facility ? `/facilities/${facility.id}` : '/facilities';

        action(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? 'Updated' : 'Created');
                form.reset();
                onDone?.();
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not save facility.')),
        });
    };

    return (
        <form onSubmit={submit} className="card p-4">
            <div className="mb-3">
                <h3 className="text-lg font-bold">{isEditing ? 'Edit Name' : 'Create Name'}</h3>
                <p className="text-sm text-[var(--text-subtle)]">
                    {isEditing ? 'Update grouping name' : 'Add a new facility (Name)'}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className="field-label">Name</label>
                    <input
                        className="form-input"
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="field-label">Notes</label>
                    <textarea
                        className="form-textarea"
                        value={form.data.notes}
                        onChange={(event) => form.setData('notes', event.target.value)}
                    />
                </div>
            </div>

            <button type="submit" className="btn-primary mt-4 w-full" disabled={form.processing}>
                {form.processing ? 'Saving...' : isEditing ? 'Update' : 'Save'}
            </button>
            {isEditing && (
                <button
                    type="button"
                    className="btn-secondary mt-2 w-full"
                    onClick={() => {
                        form.reset();
                        form.clearErrors();
                        onDone?.();
                    }}
                    disabled={form.processing}
                >
                    Cancel edit
                </button>
            )}
        </form>
    );
}
