import { Head, router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import AppShell from '../../../components/layout/AppShell';
import { Facility, PageProps, Program, User } from '../../../types';

interface AuditLogRow {
    id: number;
    user_id: number | null;
    facility_id: number | null;
    program_id: number | null;
    action: string;
    auditable_type: string | null;
    auditable_id: number | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    url: string | null;
    method: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

interface Props extends PageProps {
    filters: {
        action?: string | null;
        user_id?: string | number | null;
        facility_id?: string | number | null;
        program_id?: string | number | null;
        date_from?: string | null;
        date_to?: string | null;
    };
    audit_logs: AuditLogRow[];
    actions: string[];
    users: Pick<User, 'id' | 'name' | 'email'>[];
    facilities: Pick<Facility, 'id' | 'name'>[];
    programs: Pick<Program, 'id' | 'name'>[];
}

function fmtTarget(row: AuditLogRow): string {
    if (!row.auditable_type || !row.auditable_id) return '-';
    const parts = row.auditable_type.split('\\');
    return `${parts[parts.length - 1]}#${row.auditable_id}`;
}

export default function AdminAuditLogsIndex({ filters, audit_logs, actions, users, facilities, programs }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const [form, setForm] = useState({
        action: filters.action ?? '',
        user_id: filters.user_id ? String(filters.user_id) : '',
        facility_id: filters.facility_id ? String(filters.facility_id) : '',
        program_id: filters.program_id ? String(filters.program_id) : '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    const userMap = useMemo(() => {
        const map = new Map<number, string>();
        users.forEach((u) => map.set(u.id, `${u.name} (${u.email})`));
        return map;
    }, [users]);

    const facilityMap = useMemo(() => new Map(facilities.map((f) => [f.id, f.name] as const)), [facilities]);
    const programMap = useMemo(() => new Map(programs.map((p) => [p.id, p.name] as const)), [programs]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const params = Object.fromEntries(
            Object.entries(form).filter(([, v]) => String(v ?? '').trim() !== '')
        );
        router.get('/admin/audit-logs', params, { preserveScroll: true, preserveState: true });
    };

    const clear = () => {
        setForm({ action: '', user_id: '', facility_id: '', program_id: '', date_from: '', date_to: '' });
        router.get('/admin/audit-logs', {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <>
            <Head title="Audit Trail" />
            <AppShell title="Audit Trail" description="Track who did what, when, and where.">
                <form onSubmit={submit} className="card p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                        <div className="md:col-span-1">
                            <label className="field-label">Action</label>
                            <select className="form-select" value={form.action} onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}>
                                <option value="">All</option>
                                {actions.map((a) => (
                                    <option key={a} value={a}>
                                        {a}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="field-label">User</label>
                            <select className="form-select" value={form.user_id} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))}>
                                <option value="">All</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="field-label">Location</label>
                            <select className="form-select" value={form.facility_id} onChange={(e) => setForm((p) => ({ ...p, facility_id: e.target.value }))}>
                                <option value="">All</option>
                                {facilities.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="field-label">Program</label>
                            <select className="form-select" value={form.program_id} onChange={(e) => setForm((p) => ({ ...p, program_id: e.target.value }))}>
                                <option value="">All</option>
                                {programs.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="field-label">From</label>
                            <input className="form-input" type="date" value={form.date_from} onChange={(e) => setForm((p) => ({ ...p, date_from: e.target.value }))} />
                        </div>
                        <div className="md:col-span-1">
                            <label className="field-label">To</label>
                            <input className="form-input" type="date" value={form.date_to} onChange={(e) => setForm((p) => ({ ...p, date_to: e.target.value }))} />
                        </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <button type="submit" className="btn-primary px-3">
                            Apply
                        </button>
                        <button type="button" className="btn-secondary px-3" onClick={clear}>
                            Clear
                        </button>
                    </div>
                </form>

                <section className="card overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[color:var(--surface-soft)] text-left text-[color:var(--text-subtle)]">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Time</th>
                                <th className="px-4 py-3 font-semibold">User</th>
                                <th className="px-4 py-3 font-semibold">Action</th>
                                <th className="px-4 py-3 font-semibold">Target</th>
                                <th className="px-4 py-3 font-semibold">Location</th>
                                <th className="px-4 py-3 font-semibold">Program</th>
                                <th className="px-4 py-3 font-semibold">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audit_logs.map((row) => {
                                const expanded = expandedId === row.id;
                                return (
                                    <tr key={row.id} className="border-t border-[color:var(--border-subtle)] align-top">
                                        <td className="px-4 py-3 text-[color:var(--text-muted)]">{new Date(row.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-[color:var(--text-muted)]">
                                            {row.user_id ? userMap.get(row.user_id) ?? `User#${row.user_id}` : 'System'}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-[color:var(--text-strong)]">{row.action}</td>
                                        <td className="px-4 py-3 text-[color:var(--text-muted)]">{fmtTarget(row)}</td>
                                        <td className="px-4 py-3 text-[color:var(--text-muted)]">
                                            {row.facility_id ? facilityMap.get(row.facility_id) ?? `#${row.facility_id}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-[color:var(--text-muted)]">
                                            {row.program_id ? programMap.get(row.program_id) ?? `#${row.program_id}` : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => setExpandedId(expanded ? null : row.id)}>
                                                {expanded ? 'Hide' : 'View'}
                                            </button>
                                            {expanded && (
                                                <div className="mt-2 space-y-2 text-xs text-[color:var(--text-muted)]">
                                                    {row.method && row.url && (
                                                        <p className="break-words">
                                                            <span className="font-semibold">{row.method}</span> {row.url}
                                                        </p>
                                                    )}
                                                    {(row.old_values || row.new_values) && (
                                                        <pre className="whitespace-pre-wrap rounded border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-2">
                                                            {JSON.stringify({ old: row.old_values, new: row.new_values }, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {audit_logs.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-[color:var(--text-subtle)]">
                                        No audit logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </AppShell>
        </>
    );
}

