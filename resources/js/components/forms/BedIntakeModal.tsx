import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { ArrestCount, Bed, DaysRange, Patient, PastYearCount, ServiceAccess, YesNoNA } from '../../types';

function bedTypeLabel(type: Bed['bed_type']): string {
    switch (type) {
        case 'single':
            return 'Single';
        case 'ada_single':
            return 'ADA Single';
        case 'double_top':
            return 'Double - Top';
        case 'double_bottom':
            return 'Double - Bottom';
        default:
            return String(type);
    }
}

interface Props {
    open: boolean;
    bed: Bed | null;
    onClose: () => void;
}

export default function BedIntakeModal({ open, bed, onClose }: Props) {
    const today = new Date().toISOString().slice(0, 10);

    const form = useForm({
        first_name: '',
        last_name: '',
        dob: '',
        status: 'referral' as Patient['status'],
        referral_from: '',
        insurance: '',
        intake_date: today,
        discharge_date: '',
        bed_id: bed?.id ?? null,

        psych_services_access: '' as '' | ServiceAccess,
        therapy_services_access: '' as '' | ServiceAccess,
        pcp_services_access: '' as '' | ServiceAccess,
        medications_access: '' as '' | ServiceAccess,
        er_visits_past_year: '' as '' | PastYearCount,
        inpatient_stays_past_year: '' as '' | PastYearCount,
        dependable_transportation: '' as '' | '1' | '0',
        stable_housing: '' as '' | '1' | '0',
        homelessness_days_past_year: '' as '' | PastYearCount,
        vital_documents_access: '' as '' | '1' | '0',
        phone_access: '' as '' | '1' | '0',
        employed_or_income: '' as '' | '1' | '0',
        support_system: '' as '' | '1' | '0',
        is_veteran: '' as '' | '1' | '0',
        veteran_connected_services: '' as '' | YesNoNA,
        seeking_mat_services: '' as '' | '1' | '0',
        enrolled_mat_services: '' as '' | '1' | '0',
        arrests_past_12_months: '' as '' | ArrestCount,
        arrests_lifetime: '' as '' | ArrestCount,
        jail_days_past_12_months: '' as '' | DaysRange,
        jail_days_lifetime: '' as '' | DaysRange,
        prison_time_past_12_months: '' as '' | DaysRange,
        prison_time_lifetime: '' as '' | DaysRange,
    });

    useEffect(() => {
        if (!open) return;
        form.reset();
        form.clearErrors();
        form.setData('intake_date', today);
        form.setData('bed_id', bed?.id ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, bed?.id]);

    if (!open || !bed) return null;

    const hasOccupant = (bed.patients?.length ?? 0) > 0;
    const disabled = bed.status === 'maintenance' || hasOccupant;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (disabled) return;

        if (form.data.status === 'referral' && !form.data.referral_from.trim()) {
            toast.error('Referral From is required for referrals.');
            return;
        }

        form.transform((data) => ({
            ...data,
            referral_from: data.referral_from.trim() ? data.referral_from.trim() : (null as any),
            insurance: data.insurance.trim() ? data.insurance.trim() : (null as any),
            discharge_date: data.discharge_date ? data.discharge_date : (null as any),
            dependable_transportation: data.dependable_transportation === '' ? (null as any) : data.dependable_transportation === '1',
            stable_housing: data.stable_housing === '' ? (null as any) : data.stable_housing === '1',
            vital_documents_access: data.vital_documents_access === '' ? (null as any) : data.vital_documents_access === '1',
            phone_access: data.phone_access === '' ? (null as any) : data.phone_access === '1',
            employed_or_income: data.employed_or_income === '' ? (null as any) : data.employed_or_income === '1',
            support_system: data.support_system === '' ? (null as any) : data.support_system === '1',
            is_veteran: data.is_veteran === '' ? (null as any) : data.is_veteran === '1',
            seeking_mat_services: data.seeking_mat_services === '' ? (null as any) : data.seeking_mat_services === '1',
            enrolled_mat_services: data.enrolled_mat_services === '' ? (null as any) : data.enrolled_mat_services === '1',
            veteran_connected_services:
                data.veteran_connected_services || (data.is_veteran === '0' ? ('na' as any) : (null as any)),
        }));

        form.post('/patients', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Saved');
                onClose();
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Could not intake.')),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" className="modal-backdrop" onClick={onClose} />
            <section className="card modal-panel relative z-10 w-full max-w-4xl max-h-[85vh] overflow-y-auto p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-extrabold">Intake to Bed</h3>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-subtle)' }}>
                            Room {bed.room?.name ?? '—'} • Bed {bed.bed_number} • {bedTypeLabel(bed.bed_type)}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="btn-secondary p-2" aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {bed.status === 'maintenance' && (
                    <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                        This bed is under maintenance and cannot accept an intake.
                    </div>
                )}
                {hasOccupant && (
                    <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        This bed is already occupied.
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="field-label">First Name</label>
                            <input
                                className="form-input"
                                value={form.data.first_name}
                                onChange={(e) => form.setData('first_name', e.target.value)}
                                required
                                disabled={disabled}
                            />
                        </div>
                        <div>
                            <label className="field-label">Last Name</label>
                            <input
                                className="form-input"
                                value={form.data.last_name}
                                onChange={(e) => form.setData('last_name', e.target.value)}
                                required
                                disabled={disabled}
                            />
                        </div>
                        <div>
                            <label className="field-label">DOB</label>
                            <input
                                type="date"
                                className="form-input"
                                value={form.data.dob}
                                onChange={(e) => form.setData('dob', e.target.value)}
                                required
                                disabled={disabled}
                            />
                        </div>
                        <div>
                            <label className="field-label">Status</label>
                            <select
                                className="form-select"
                                value={form.data.status}
                                onChange={(e) => {
                                    const next = e.target.value as Patient['status'];
                                    form.setData('status', next);
                                    if (next === 'walk_in') form.setData('referral_from', '');
                                }}
                                disabled={disabled}
                            >
                                <option value="referral">Referral</option>
                                <option value="walk_in">Walk-In</option>
                            </select>
                        </div>
                        <div>
                            <label className="field-label">Referral From</label>
                            <input
                                className="form-input"
                                value={form.data.referral_from}
                                onChange={(e) => form.setData('referral_from', e.target.value)}
                                required={form.data.status === 'referral'}
                                disabled={disabled || form.data.status === 'walk_in'}
                                placeholder={form.data.status === 'walk_in' ? 'Optional for Walk-In' : 'Required for Referral'}
                            />
                        </div>
                        <div>
                            <label className="field-label">Insurance</label>
                            <input
                                className="form-input"
                                value={form.data.insurance}
                                onChange={(e) => form.setData('insurance', e.target.value)}
                                disabled={disabled}
                            />
                        </div>
                        <div>
                            <label className="field-label">Intake Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={form.data.intake_date}
                                onChange={(e) => form.setData('intake_date', e.target.value)}
                                required
                                disabled={disabled}
                            />
                        </div>
                        <div>
                            <label className="field-label">Discharge Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={form.data.discharge_date}
                                onChange={(e) => form.setData('discharge_date', e.target.value)}
                                disabled={disabled}
                            />
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4">
                        <h4 className="text-sm font-semibold text-[color:var(--text-strong)]">Admission Questionnaire</h4>
                        <p className="mt-1 text-xs" style={{ color: 'var(--text-subtle)' }}>
                            Required questions for allocating a client to a bed
                        </p>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="field-label">Psych services access</label>
                                <select
                                    className="form-select"
                                    value={form.data.psych_services_access}
                                    onChange={(e) => form.setData('psych_services_access', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="wc_health">With WC Health</option>
                                    <option value="other_agency">Yes - Other Agency</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Therapy services access</label>
                                <select
                                    className="form-select"
                                    value={form.data.therapy_services_access}
                                    onChange={(e) => form.setData('therapy_services_access', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="wc_health">With WC Health</option>
                                    <option value="other_agency">Yes - Other Agency</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">PCP services access</label>
                                <select
                                    className="form-select"
                                    value={form.data.pcp_services_access}
                                    onChange={(e) => form.setData('pcp_services_access', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="wc_health">With WC Health</option>
                                    <option value="other_agency">Yes - Other Agency</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Medications access</label>
                                <select
                                    className="form-select"
                                    value={form.data.medications_access}
                                    onChange={(e) => form.setData('medications_access', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="wc_health">With WC Health</option>
                                    <option value="other_agency">Yes - Other Agency</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">ER visits (past year)</label>
                                <select
                                    className="form-select"
                                    value={form.data.er_visits_past_year}
                                    onChange={(e) => form.setData('er_visits_past_year', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="0">0 stays</option>
                                    <option value="1_3">1-3 stays</option>
                                    <option value="4_10">4-10 stays</option>
                                    <option value="10_plus">10+ stays</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Inpatient stays (past year)</label>
                                <select
                                    className="form-select"
                                    value={form.data.inpatient_stays_past_year}
                                    onChange={(e) => form.setData('inpatient_stays_past_year', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="0">0 stays</option>
                                    <option value="1_3">1-3 stays</option>
                                    <option value="4_10">4-10 stays</option>
                                    <option value="10_plus">10+ stays</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Dependable transportation</label>
                                <select
                                    className="form-select"
                                    value={form.data.dependable_transportation}
                                    onChange={(e) => form.setData('dependable_transportation', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Stable housing</label>
                                <select
                                    className="form-select"
                                    value={form.data.stable_housing}
                                    onChange={(e) => form.setData('stable_housing', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="field-label">Days living with homelessness (past year)</label>
                                <select
                                    className="form-select"
                                    value={form.data.homelessness_days_past_year}
                                    onChange={(e) => form.setData('homelessness_days_past_year', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="0">0 days</option>
                                    <option value="1_3">1-3 days</option>
                                    <option value="4_10">4-10 days</option>
                                    <option value="10_plus">10+ days</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Access to vital ID documents</label>
                                <select
                                    className="form-select"
                                    value={form.data.vital_documents_access}
                                    onChange={(e) => form.setData('vital_documents_access', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Access to a phone</label>
                                <select
                                    className="form-select"
                                    value={form.data.phone_access}
                                    onChange={(e) => form.setData('phone_access', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Currently employed or has income</label>
                                <select
                                    className="form-select"
                                    value={form.data.employed_or_income}
                                    onChange={(e) => form.setData('employed_or_income', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Support system to depend on</label>
                                <select
                                    className="form-select"
                                    value={form.data.support_system}
                                    onChange={(e) => form.setData('support_system', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Is the client a veteran?</label>
                                <select
                                    className="form-select"
                                    value={form.data.is_veteran}
                                    onChange={(e) => {
                                        const next = e.target.value as any;
                                        form.setData('is_veteran', next);
                                        if (next === '0') form.setData('veteran_connected_services', 'na');
                                        if (next === '1' && form.data.veteran_connected_services === 'na') {
                                            form.setData('veteran_connected_services', '' as any);
                                        }
                                    }}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Connected to services for Veterans</label>
                                <select
                                    className="form-select"
                                    value={form.data.veteran_connected_services}
                                    onChange={(e) => form.setData('veteran_connected_services', e.target.value as any)}
                                    required
                                    disabled={disabled || form.data.is_veteran === '0'}
                                >
                                    <option value="">Select</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                    <option value="na">N/A</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Seeking MAT services</label>
                                <select
                                    className="form-select"
                                    value={form.data.seeking_mat_services}
                                    onChange={(e) => form.setData('seeking_mat_services', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Enrolled in MAT services</label>
                                <select
                                    className="form-select"
                                    value={form.data.enrolled_mat_services}
                                    onChange={(e) => form.setData('enrolled_mat_services', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Arrests (past 12 months)</label>
                                <select
                                    className="form-select"
                                    value={form.data.arrests_past_12_months}
                                    onChange={(e) => form.setData('arrests_past_12_months', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="0">Past 12 months - 0 times</option>
                                    <option value="1_2">Past 12 months - 1 to 2 times</option>
                                    <option value="3_4">Past 12 months - 3 to 4 times</option>
                                    <option value="5_plus">Past 12 months - 5 or more times</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Arrests (lifetime)</label>
                                <select
                                    className="form-select"
                                    value={form.data.arrests_lifetime}
                                    onChange={(e) => form.setData('arrests_lifetime', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="0">Lifetime - 0 times</option>
                                    <option value="1_2">Lifetime - 1 to 2 times</option>
                                    <option value="3_4">Lifetime - 3 to 4 times</option>
                                    <option value="5_plus">Lifetime - 5 or more times</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Days in jail (past 12 months)</label>
                                <select
                                    className="form-select"
                                    value={form.data.jail_days_past_12_months}
                                    onChange={(e) => form.setData('jail_days_past_12_months', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="0">Past 12 months - 0 days</option>
                                    <option value="1_7">Past 12 months - 1-7 days</option>
                                    <option value="8_14">Past 12 months - 8-14 days</option>
                                    <option value="14_plus">Past 12 months - 14+ days</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Days in jail (lifetime)</label>
                                <select
                                    className="form-select"
                                    value={form.data.jail_days_lifetime}
                                    onChange={(e) => form.setData('jail_days_lifetime', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="0">Lifetime - 0 days</option>
                                    <option value="1_7">Lifetime - 1-7 days</option>
                                    <option value="8_14">Lifetime - 8-14 days</option>
                                    <option value="14_plus">Lifetime - 14+ days</option>
                                </select>
                            </div>

                            <div>
                                <label className="field-label">Time in prison (past 12 months)</label>
                                <select
                                    className="form-select"
                                    value={form.data.prison_time_past_12_months}
                                    onChange={(e) => form.setData('prison_time_past_12_months', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="0">Past 12 months - 0</option>
                                    <option value="1_7">Past 12 months - 1-7 days</option>
                                    <option value="8_14">Past 12 months - 8-14 days</option>
                                    <option value="14_plus">Past 12 months - 14+</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Time in prison (lifetime)</label>
                                <select
                                    className="form-select"
                                    value={form.data.prison_time_lifetime}
                                    onChange={(e) => form.setData('prison_time_lifetime', e.target.value as any)}
                                    required
                                    disabled={disabled}
                                >
                                    <option value="">Select</option>
                                    <option value="0">Lifetime - 0</option>
                                    <option value="1_7">Lifetime - 1-7 days</option>
                                    <option value="8_14">Lifetime - 8-14 days</option>
                                    <option value="14_plus">Lifetime - 14+</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary mt-4 w-full" disabled={form.processing || disabled}>
                        {form.processing ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </section>
        </div>
    );
}
