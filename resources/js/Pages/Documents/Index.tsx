import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import DocumentUploadForm from '../../components/forms/DocumentUploadForm';
import DocumentPanel from '../../components/documents/DocumentPanel';
import { Document, PageProps, Patient } from '../../types';

interface Props extends PageProps {
    documents: Document[];
    patients: Patient[];
}

export default function DocumentsIndex({ documents, patients }: Props) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['documents'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Documents" />
            <AppShell title="Documents" description="Upload and manage patient files">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <DocumentPanel documents={documents} patients={patients} />
                    </div>
                    <DocumentUploadForm patients={patients} />
                </div>
            </AppShell>
        </>
    );
}
