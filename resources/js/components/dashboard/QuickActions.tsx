import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Bed, Patient } from '../../types';
import toast from 'react-hot-toast';

interface Props {
    beds: Bed[];
    patients: Patient[];
    wards: { id: number; name: string }[];
}

export default function QuickActions({ beds, patients, wards }: Props) {
    // ── Create Bed ──
    const bedForm = useForm({
        bed_number: '',
        ward_id: wards[0]?.id ?? '',
        room: '',
        status: 'available' as Bed['status'],
    });

    // ── Create Patient ──
    const patientForm = useForm({
        name: '',
        age: 50,
        gender: 'N/A',
        diagnosis: 'General',
        status: 'stable' as Patient['status'],
        doctor: 'Dr. Adams',
        admission_date: new Date().toISOString().slice(0, 10),
        contact: '555-1234',
        notes: '',
    });

    // ── Assignment ──
    const [assignBedId, setAssignBedId] = useState('');
    const [assignPatientId, setAssignPatientId] = useState('');

    // ── Document upload ──
    const docForm = useForm<{ patient_id: string; file: File | null }>({
        patient_id: '',
        file: null,
    });

    const onCreateBed = (e: React.FormEvent) => {
        e.preventDefault();
        bedForm.post('/beds', {
            onSuccess: () => bedForm.reset(),
            onError: () => toast.error(Object.values(bedForm.errors)[0] ?? 'Failed'),
        });
    };

    const onCreatePatient = (e: React.FormEvent) => {
        e.preventDefault();
        patientForm.post('/patients', {
            onSuccess: () => patientForm.reset(),
            onError: () => toast.error(Object.values(patientForm.errors)[0] ?? 'Failed'),
        });
    };

    const onAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignBedId || !assignPatientId) { toast.error('Select a bed and patient'); return; }
        router.post(`/beds/${assignBedId}/assign`, { patient_id: assignPatientId }, {
            onSuccess: () => { setAssignBedId(''); setAssignPatientId(''); },
            onError: (err) => toast.error(Object.values(err)[0] ?? 'Failed'),
        });
    };

    const onDischarge = () => {
        if (!assignBedId) return;
        router.post(`/beds/${assignBedId}/discharge`, {}, {
            onError: (err) => toast.error(Object.values(err)[0] ?? 'Failed'),
        });
    };

    const onUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!docForm.data.patient_id || !docForm.data.file) { toast.error('Select patient and file'); return; }
        docForm.post('/documents', {
            forceFormData: true,
            onSuccess: () => docForm.reset(),
            onError: () => toast.error(Object.values(docForm.errors)[0] ?? 'Upload failed'),
        });
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Create Bed */}
            <form onSubmit={onCreateBed} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">Create Bed</p>
                    <span className="text-xs text-slate-500">Bed CRUD</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input className="form-input" placeholder="Bed number" value={bedForm.data.bed_number} onChange={(e) => bedForm.setData('bed_number', e.target.value)} required />
                    <select className="form-input" value={bedForm.data.ward_id} onChange={(e) => bedForm.setData('ward_id', Number(e.target.value))}>
                        {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    <input className="form-input" placeholder="Room" value={bedForm.data.room} onChange={(e) => bedForm.setData('room', e.target.value)} required />
                    <select className="form-input" value={bedForm.data.status} onChange={(e) => bedForm.setData('status', e.target.value as Bed['status'])}>
                        {(['available','occupied','cleaning','maintenance'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button className="btn-primary w-full" type="submit" disabled={bedForm.processing}>Save bed</button>
            </form>

            {/* Create Patient */}
            <form onSubmit={onCreatePatient} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">Create Patient</p>
                    <span className="text-xs text-slate-500">Patient CRUD</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input className="form-input" placeholder="Full name" value={patientForm.data.name} onChange={(e) => patientForm.setData('name', e.target.value)} required />
                    <input className="form-input" type="number" placeholder="Age" value={patientForm.data.age} onChange={(e) => patientForm.setData('age', Number(e.target.value))} required />
                    <input className="form-input" placeholder="Diagnosis" value={patientForm.data.diagnosis} onChange={(e) => patientForm.setData('diagnosis', e.target.value)} required />
                    <select className="form-input" value={patientForm.data.status} onChange={(e) => patientForm.setData('status', e.target.value as Patient['status'])}>
                        {(['stable','critical','recovering','discharged'] as const).map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <input className="form-input" placeholder="Doctor" value={patientForm.data.doctor} onChange={(e) => patientForm.setData('doctor', e.target.value)} required />
                    <input className="form-input" placeholder="Contact" value={patientForm.data.contact} onChange={(e) => patientForm.setData('contact', e.target.value)} required />
                    <input className="form-input" type="date" value={patientForm.data.admission_date} onChange={(e) => patientForm.setData('admission_date', e.target.value)} />
                    <input className="form-input" placeholder="Notes" value={patientForm.data.notes} onChange={(e) => patientForm.setData('notes', e.target.value)} />
                </div>
                <button className="btn-primary w-full" type="submit" disabled={patientForm.processing}>Save patient</button>
            </form>

            {/* Assign / Discharge */}
            <form onSubmit={onAssign} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">Assign Patient to Bed</p>
                    <span className="text-xs text-slate-500">Assignment</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <select className="form-input" value={assignBedId} onChange={(e) => setAssignBedId(e.target.value)} required>
                        <option value="">Select bed</option>
                        {beds.map((b) => <option key={b.id} value={b.id}>Bed {b.bed_number} ({b.status})</option>)}
                    </select>
                    <select className="form-input" value={assignPatientId} onChange={(e) => setAssignPatientId(e.target.value)} required>
                        <option value="">Select patient</option>
                        {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button className="btn-primary w-full" type="submit">Assign</button>
                    {assignBedId && (
                        <button type="button" onClick={onDischarge} className="btn-ghost w-full">Discharge</button>
                    )}
                </div>
            </form>

            {/* Upload Document */}
            <form onSubmit={onUpload} className="card p-4 space-y-3" id="documents">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">Upload Document</p>
                    <span className="text-xs text-slate-500">Document CRUD</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <select className="form-input" value={docForm.data.patient_id} onChange={(e) => docForm.setData('patient_id', e.target.value)} required>
                        <option value="">Select patient</option>
                        {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input className="form-input" type="file" onChange={(e) => docForm.setData('file', e.target.files?.[0] ?? null)} required />
                </div>
                <button className="btn-primary w-full" type="submit" disabled={docForm.processing}>Upload</button>
            </form>
        </div>
    );
}
