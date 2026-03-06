import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import AppShell from '../../../components/layout/AppShell';
import { Facility, PageProps, Program, User } from '../../../types';
import { ChevronDown } from 'lucide-react';

type AdminUser = User & {
    created_at?: string;
};

interface Props extends PageProps {
    users: AdminUser[];
    facilities: Pick<Facility, 'id' | 'name'>[];
    programs: Pick<Program, 'id' | 'name'>[];
}

export default function AdminUsersIndex({ users, facilities, programs }: Props) {
    const [saving, setSaving] = useState<number | null>(null);
    const [openProgramsFor, setOpenProgramsFor] = useState<number | null>(null);
    const programsDropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (openProgramsFor === null) return;

        const onMouseDown = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (target && programsDropdownRef.current && !programsDropdownRef.current.contains(target)) {
                setOpenProgramsFor(null);
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenProgramsFor(null);
            }
        };

        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [openProgramsFor]);

    const initial = useMemo(() => {
        const map: Record<number, { facility_id: number | ''; program_ids: number[]; can_login: boolean; is_admin: boolean }> = {};
        users.forEach((u) => {
            map[u.id] = {
                facility_id: (u.facility_id ?? '') as any,
                program_ids: (u.program_ids ?? (u.program_id ? [u.program_id] : [])).filter(Boolean) as number[],
                can_login: u.can_login ?? true,
                is_admin: Boolean(u.is_admin),
            };
        });
        return map;
    }, [users]);

    const programNameById = useMemo(() => {
        const map = new Map<number, string>();
        programs.forEach((p) => map.set(p.id, p.name));
        return map;
    }, [programs]);

    const [draft, setDraft] = useState(initial);

    const setFor = (id: number, patch: Partial<(typeof draft)[number]>) => {
        setDraft((prev) => ({
            ...prev,
            [id]: { ...(prev[id] ?? { facility_id: '', program_ids: [], can_login: true, is_admin: false }), ...patch },
        }));
    };

    const saveAssignment = (id: number) => {
        const row = draft[id];
        if (!row?.facility_id && !row?.is_admin) {
            toast.error('Select a Location.');
            return;
        }
        if (!row.is_admin && row.can_login && (row.program_ids?.length ?? 0) === 0) {
            toast.error('Select at least one Program.');
            return;
        }
        setSaving(id);
        router.patch(
            `/admin/users/${id}/assignment`,
            {
                facility_id: row.facility_id ? Number(row.facility_id) : null,
                program_ids: row.program_ids,
                can_login: Boolean(row.can_login),
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Assignment saved.'),
                onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not save assignment.')),
                onFinish: () => setSaving(null),
            }
        );
    };

    const saveAdmin = (id: number, is_admin: boolean) => {
        setSaving(id);
        router.patch(
            `/admin/users/${id}/admin`,
            { is_admin },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Role updated.'),
                onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not update role.')),
                onFinish: () => setSaving(null),
            }
        );
    };

    return (
        <>
            <Head title="Admin Users" />
            <AppShell title="Admin Users" description="Authorize login and allocate Location + Program access per account.">
                <section className="card overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[color:var(--surface-soft)] text-left text-[color:var(--text-subtle)]">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Email</th>
                                <th className="px-4 py-3 font-semibold">Admin</th>
                                <th className="px-4 py-3 font-semibold">Can Login</th>
                                <th className="px-4 py-3 font-semibold">Location</th>
                                <th className="px-4 py-3 font-semibold">Programs</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const row = draft[u.id] ?? { facility_id: '', program_ids: [], can_login: true, is_admin: Boolean(u.is_admin) };
                                const disabled = saving === u.id;
                                const unassigned = !u.is_admin && (!u.facility_id || (u.program_ids?.length ?? 0) === 0);
                                return (
                                    <tr key={u.id} className="border-t border-[color:var(--border-subtle)]">
                                        <td className="px-4 py-3 font-semibold text-[color:var(--text-strong)]">
                                            {u.name}
                                            {unassigned && (
                                                <span className="ml-2 badge bg-amber-100 text-amber-800">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-[color:var(--text-muted)]">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(row.is_admin)}
                                                    onChange={(e) => {
                                                        const next = e.target.checked;
                                                        setFor(u.id, { is_admin: next });
                                                        saveAdmin(u.id, next);
                                                    }}
                                                    disabled={disabled}
                                                />
                                                <span className="text-[color:var(--text-muted)]">Admin</span>
                                            </label>
                                        </td>
                                        <td className="px-4 py-3">
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(row.can_login)}
                                                    onChange={(e) => setFor(u.id, { can_login: e.target.checked })}
                                                    disabled={disabled}
                                                />
                                                <span className="text-[color:var(--text-muted)]">Enabled</span>
                                            </label>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                className="form-select"
                                                value={row.facility_id}
                                                onChange={(e) => setFor(u.id, { facility_id: e.target.value ? Number(e.target.value) : '' })}
                                                disabled={disabled}
                                            >
                                                <option value="">Select</option>
                                                {facilities.map((f) => (
                                                    <option key={f.id} value={f.id}>
                                                        {f.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="relative min-w-[240px]" ref={openProgramsFor === u.id ? programsDropdownRef : undefined}>
                                                <button
                                                    type="button"
                                                    className="form-select flex w-full items-center justify-between gap-2"
                                                    onClick={() => setOpenProgramsFor((prev) => (prev === u.id ? null : u.id))}
                                                    disabled={disabled}
                                                >
                                                    <span className="truncate text-left">
                                                        {row.program_ids.length === 0
                                                            ? 'Select programs'
                                                            : row.program_ids.length === 1
                                                                ? (programNameById.get(row.program_ids[0]) ?? `#${row.program_ids[0]}`)
                                                                : `${row.program_ids.length} programs selected`}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                                                </button>

                                                {openProgramsFor === u.id && (
                                                    <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-[color:var(--border-soft)] bg-white shadow-lg">
                                                        <div className="max-h-56 overflow-auto p-2">
                                                            {programs.map((p) => {
                                                                const checked = row.program_ids.includes(p.id);
                                                                return (
                                                                    <label
                                                                        key={p.id}
                                                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)]"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={(e) => {
                                                                                const next = e.target.checked;
                                                                                const set = new Set(row.program_ids);
                                                                                if (next) set.add(p.id);
                                                                                else set.delete(p.id);
                                                                                setFor(u.id, { program_ids: Array.from(set.values()) });
                                                                            }}
                                                                            disabled={disabled}
                                                                        />
                                                                        <span className="truncate">{p.name}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                className="btn-primary !px-3 !py-2"
                                                onClick={() => saveAssignment(u.id)}
                                                disabled={disabled}
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>
            </AppShell>
        </>
    );
}
