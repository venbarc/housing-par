import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import WardCreateForm from '../../components/forms/WardCreateForm';
import WardPanel from '../../components/wards/WardPanel';
import { PageProps, Ward } from '../../types';

interface Props extends PageProps {
    wards: Ward[];
}

export default function WardsIndex({ wards }: Props) {
    const [editingWard, setEditingWard] = useState<Ward | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['wards'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Wards" />
            <AppShell title="Wards" description="Ward registry and floor metadata">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <WardPanel wards={wards} onEdit={setEditingWard} editingId={editingWard?.id ?? null} />
                    </div>
                    <WardCreateForm ward={editingWard} onDone={() => setEditingWard(null)} />
                </div>
            </AppShell>
        </>
    );
}
