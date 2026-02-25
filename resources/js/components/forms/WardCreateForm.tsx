import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Ward } from '../../types';

interface Props {
    ward?: Ward | null;
    onDone?: () => void;
}

export default function WardCreateForm({ ward, onDone }: Props) {
    const form = useForm({
        name: '',
        floor: '',
        description: '',
    });

    const isEditing = Boolean(ward);

    useEffect(() => {
        if (ward) {
            form.setData('name', ward.name);
            form.setData('floor', ward.floor ?? '');
            form.setData('description', ward.description ?? '');
        } else {
            form.reset();
        }
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ward?.id]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const action = isEditing ? form.patch : form.post;
        const url = isEditing && ward ? `/wards/${ward.id}` : '/wards';

        action(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? 'Ward updated' : 'Ward created');
                form.reset();
                onDone?.();
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not save ward.')),
        });
    };

    return (
        <form onSubmit={submit} className="card p-4">
            <div className="mb-3">
                <h3 className="text-lg font-bold">{isEditing ? 'Edit Ward' : 'Create Ward'}</h3>
                <p className="text-sm text-[var(--text-subtle)]">
                    {isEditing ? 'Update ward details and metadata' : 'Add a treatment area and metadata'}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className="field-label">Ward Name</label>
                    <input className="form-input" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                </div>
                <div>
                    <label className="field-label">Floor</label>
                    <input className="form-input" value={form.data.floor} onChange={(event) => form.setData('floor', event.target.value)} />
                </div>
                <div>
                    <label className="field-label">Description</label>
                    <textarea className="form-textarea" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                </div>
            </div>

            <button type="submit" className="btn-primary mt-4 w-full" disabled={form.processing}>
                {form.processing ? 'Saving...' : isEditing ? 'Update Ward' : 'Save Ward'}
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
