import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import ImportResultBanner from '../../components/import/ImportResultBanner';
import RoomsBedsImportTab from '../../components/import/RoomsBedsImportTab';
import PatientsImportTab from '../../components/import/PatientsImportTab';
import { Facility, PageProps, Program } from '../../types';

interface Props extends PageProps {
    facilities: Facility[];
    programs: Program[];
}

export default function ImportIndex({ facilities, programs }: Props) {
    const { props } = usePage<PageProps>();
    const importResult = props.flash?.import_result ?? null;
    const [activeTab, setActiveTab] = useState<'rooms-beds' | 'patients'>('rooms-beds');

    const tabs = [
        { key: 'rooms-beds' as const, label: 'Rooms & Beds' },
        { key: 'patients' as const, label: 'Patients' },
    ];

    return (
        <>
            <Head title="Import" />
            <AppShell title="Import" description="Bulk import rooms, beds, and patients from CSV files">
                {importResult && <ImportResultBanner result={importResult} />}

                <section className="card p-4">
                    <div className="mb-4 flex gap-2 border-b border-[var(--border-soft)]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
                                    activeTab === tab.key
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)]'
                                }`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'rooms-beds' && (
                        <RoomsBedsImportTab facilities={facilities} programs={programs} />
                    )}
                    {activeTab === 'patients' && (
                        <PatientsImportTab facilities={facilities} />
                    )}
                </section>
            </AppShell>
        </>
    );
}
