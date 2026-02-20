"use client";

import Sidebar from "../components/layout/sidebar";
import Topbar from "../components/layout/topbar";
import StatCards from "../components/dashboard/stat-cards";
import BedCanvas from "../components/dashboard/bed-canvas";
import QuickActions from "../components/dashboard/quick-actions";
import NotificationList from "../components/notifications/notification-list";
import PatientTable from "../components/patients/patient-table";
import DocumentPanel from "../components/documents/document-panel";
import WardPanel from "../components/wards/ward-panel";
import { useCollection } from "../hooks/useCollection";
import { Bed, DocumentRecord, NotificationRecord, Patient, Ward } from "../types";

export default function Home() {
  const { data: beds } = useCollection<Bed>("beds");
  const { data: patients } = useCollection<Patient>("patients");
  const { data: documents } = useCollection<DocumentRecord>("documents");
  const { data: notifications } = useCollection<NotificationRecord>("notifications");
  const { data: wards } = useCollection<Ward>("wards");

  return (
    <div className="min-h-screen">
      <Topbar />
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
          <QuickActions beds={beds} patients={patients} />
          <PatientTable patients={patients} />
          <WardPanel wards={wards} />
        </main>
      </div>
    </div>
  );
}
