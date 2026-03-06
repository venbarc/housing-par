import { Head } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import AppShell from '../../../components/layout/AppShell';
import { PageProps, Program } from '../../../types';

interface Props extends PageProps {
    programs: Program[];
}

export default function AdminProgramsIndex({ programs }: Props) {
    const [editing, setEditing] = useState<Program | null>(null);

    const form = useForm({
        name: '',
        notes: '',
    });

    useEffect(() => {
        if (editing) {
            form.setData('name', editing.name);
            form.setData('notes', editing.notes ?? '');
        } else {
            form.reset();
        }
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing?.id]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const url = editing ? `/admin/programs/${editing.id}` : '/admin/programs';
        const action = editing ? form.patch : form.post;

        action(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(editing ? 'Program updated' : 'Program created');
                form.reset();
                setEditing(null);
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not save program.')),
        });
    };

    const remove = (program: Program) => {
        if (!confirm(`Delete program "${program.name}"?`)) return;
        router.delete(`/admin/programs/${program.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Program deleted'),
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not delete program.')),
        });
    };

    return (
        <>
            <Head title="Programs" />
            <AppShell title="Programs" description="Manage programs used for scoping and allocations.">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <section className="card p-4 xl:col-span-2">
                        <div className="mb-3">
                            <h3 className="text-lg font-bold">Programs</h3>
                            <p className="text-sm text-[color:var(--text-subtle)]">{programs.length} total</p>
                        </div>

                        <div className="space-y-2">
                            {programs.map((p) => (
                                <div key={p.id} className="flex items-start justify-between gap-3 rounded border border-[color:var(--border-subtle)] p-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[color:var(--text-strong)]">{p.name}</p>
                                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">{p.notes || 'No notes'}</p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => setEditing(p)}>
                                            Edit
                                        </button>
                                        <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => remove(p)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {programs.length === 0 && <p className="text-sm text-[color:var(--text-subtle)]">No programs yet.</p>}
                        </div>
                    </section>

                    <form onSubmit={submit} className="card p-4">
                        <div className="mb-3">
                            <h3 className="text-lg font-bold">{editing ? 'Edit Program' : 'Create Program'}</h3>
                            <p className="text-sm text-[color:var(--text-subtle)]">
                                {editing ? 'Update program details' : 'Add a new program'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="field-label">Program Name</label>
                                <input className="form-input" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Notes</label>
                                <textarea className="form-textarea" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary mt-4 w-full" disabled={form.processing}>
                            {form.processing ? 'Saving...' : editing ? 'Update Program' : 'Save Program'}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                className="btn-secondary mt-2 w-full"
                                onClick={() => {
                                    form.reset();
                                    form.clearErrors();
                                    setEditing(null);
                                }}
                                disabled={form.processing}
                            >
                                Cancel edit
                            </button>
                        )}
                    </form>
                </div>
            </AppShell>
        </>
    );
}

