"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, BedDouble, User, Stethoscope, Phone, Calendar, FileText, Activity } from "lucide-react";
import { Bed, Patient } from "../../types";
import { bedStatusMeta, patientStatusMeta } from "../../lib/status";

type Props = {
  bed: Bed | null;
  patient?: Patient;
  onClose: () => void;
};

export default function BedDetailModal({ bed, patient, onClose }: Props) {
  if (!bed) return null;

  const status = bedStatusMeta[bed.status];

  return (
    <AnimatePresence>
      {bed && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 grid place-items-center">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Bed {bed.bedNumber}</h2>
                  <p className="text-xs text-slate-500">Ward {bed.wardId} &bull; Room {bed.room}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Body */}
            <div className="px-5 py-4">
              {patient ? (
                <div className="space-y-4">
                  {/* Patient header */}
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-primary-100 text-primary-700 grid place-items-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{patient.name}</p>
                      <p className="text-sm text-slate-500">{patient.age} yrs &bull; {patient.gender}</p>
                    </div>
                    {patientStatusMeta[patient.status] && (
                      <span className={`ml-auto inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${patientStatusMeta[patient.status].bg} ${patientStatusMeta[patient.status].color}`}>
                        {patientStatusMeta[patient.status].label}
                      </span>
                    )}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem icon={Activity} label="Diagnosis" value={patient.diagnosis} />
                    <InfoItem icon={Stethoscope} label="Doctor" value={patient.doctor} />
                    <InfoItem icon={Calendar} label="Admitted" value={patient.admissionDate} />
                    <InfoItem icon={Phone} label="Contact" value={patient.contact} />
                  </div>

                  {/* Notes */}
                  {patient.notes && (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-xs font-medium text-slate-500">Notes</p>
                      </div>
                      <p className="text-sm text-slate-700">{patient.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 grid place-items-center mx-auto mb-3">
                    <BedDouble className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-slate-700">No patient assigned</p>
                  <p className="text-sm text-slate-500 mt-1">This bed is currently {bed.status}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
    </div>
  );
}
