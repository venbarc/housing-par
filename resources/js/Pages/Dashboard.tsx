import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Bed, Document, Notification, Patient, PageProps, Ward } from '../types';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import StatCards from '../components/dashboard/StatCards';
import BedCanvas from '../components/dashboard/BedCanvas';
import QuickActions from '../components/dashboard/QuickActions';
import NotificationList from '../components/notifications/NotificationList';
import PatientTable from '../components/patients/PatientTable';
import DocumentPanel from '../components/documents/DocumentPanel';
import WardPanel from '../components/wards/WardPanel';

interface Props extends PageProps {
    beds: Bed[];
    patients: Patient[];
    wards: Ward[];
    documents: Document[];
    notifications: Notification[];
}

export default function Dashboard({ beds, patients, wards, documents, notifications }: Props) {
    // Poll every 3 seconds for live updates (mirrors the original useCollection hook behaviour)
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['beds', 'patients', 'documents', 'notifications'],
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen">
            <Topbar notifications={notifications} />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-4 lg:p-6 space-y-4">
                    <StatCards beds={beds} patients={patients} notifications={notifications} />
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4" id="beds">
                        <div className="xl:col-span-2">
                            <BedCanvas beds={beds} patients={patients} />
                        </div>
                        <div className="space-y-4">
                            <NotificationList notifications={notifications} />
                            <DocumentPanel documents={documents} patients={patients} />
                        </div>
                    </div>
                    <QuickActions beds={beds} patients={patients} wards={wards} />
                    <PatientTable patients={patients} />
                    <WardPanel wards={wards} />
                </main>
            </div>
        </div>
    );
}
