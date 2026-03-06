<?php

namespace App\Http\Controllers;

use App\Models\Bed;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\PatientTransfer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransferController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Transfers/Index', [
            'transfers' => PatientTransfer::query()
                ->visibleTo($user)
                ->where('status', 'pending')
                ->with([
                    'sourcePatient',
                    'sourceBed.room.facility',
                    'sourceBed.room.program',
                    'sourceFacility',
                    'sourceProgram',
                    'destinationFacility',
                    'destinationProgram',
                    'requestedBy:id,name',
                ])
                ->orderByDesc('requested_at')
                ->get(),
            'available_beds' => Bed::query()
                ->visibleTo($user)
                ->where('status', 'available')
                ->with(['room.facility', 'room.program', 'patients'])
                ->orderBy('bed_number')
                ->get(),
        ]);
    }

    public function accept(Request $request, PatientTransfer $transfer): RedirectResponse
    {
        $user = $request->user();
        $this->abortIfCannotReviewTransfer($user, $transfer);

        if ($transfer->status !== 'pending') {
            return back()->withErrors(['transfer' => 'Only pending transfer requests can be accepted.']);
        }

        $data = $request->validate([
            'intake_date' => ['required', 'date'],
            'bed_id' => ['required', 'integer', 'exists:beds,id'],
        ]);

        $bed = Bed::query()->withCount('patients')->with('room')->find($data['bed_id']);
        if (! $bed || ! $bed->room) {
            return back()->withErrors(['bed_id' => 'Destination bed not found.']);
        }

        if ((int) $bed->room->facility_id !== (int) $transfer->destination_facility_id || (int) $bed->room->program_id !== (int) $transfer->destination_program_id) {
            return back()->withErrors(['bed_id' => 'Destination bed must belong to the transfer destination Location/Program.']);
        }

        if ($bed->status === 'maintenance') {
            return back()->withErrors(['bed_id' => 'Destination bed is under maintenance.']);
        }

        if ($bed->patients_count > 0 || $bed->status !== 'available') {
            return back()->withErrors(['bed_id' => 'Destination bed is not available.']);
        }

        $sourcePatient = $transfer->sourcePatient()->first();
        if (! $sourcePatient) {
            return back()->withErrors(['transfer' => 'Source patient record not found.']);
        }

        DB::transaction(function () use ($transfer, $sourcePatient, $bed, $data, $user) {
            $newPatient = Patient::create([
                'facility_id' => $transfer->destination_facility_id,
                'program_id' => $transfer->destination_program_id,
                'first_name' => $sourcePatient->first_name,
                'last_name' => $sourcePatient->last_name,
                'dob' => optional($sourcePatient->dob)->format('Y-m-d'),
                'status' => $sourcePatient->status,
                'referral_from' => $sourcePatient->referral_from,
                'insurance' => $sourcePatient->insurance,
                'intake_date' => $data['intake_date'],
                'discharge_date' => null,
                'discharged_at' => null,
                'discharge_disposition' => null,
                'discharge_destination' => null,
                'leave_details' => null,
                'move_to_facility_id' => null,
                'move_to_program_id' => null,
                'bed_id' => $bed->id,
                'discharged_bed_id' => null,
                'psych_services_access' => $sourcePatient->psych_services_access,
                'therapy_services_access' => $sourcePatient->therapy_services_access,
                'pcp_services_access' => $sourcePatient->pcp_services_access,
                'medications_access' => $sourcePatient->medications_access,
                'er_visits_past_year' => $sourcePatient->er_visits_past_year,
                'inpatient_stays_past_year' => $sourcePatient->inpatient_stays_past_year,
                'dependable_transportation' => $sourcePatient->dependable_transportation,
                'stable_housing' => $sourcePatient->stable_housing,
                'homelessness_days_past_year' => $sourcePatient->homelessness_days_past_year,
                'vital_documents_access' => $sourcePatient->vital_documents_access,
                'phone_access' => $sourcePatient->phone_access,
                'employed_or_income' => $sourcePatient->employed_or_income,
                'support_system' => $sourcePatient->support_system,
                'is_veteran' => $sourcePatient->is_veteran,
                'veteran_connected_services' => $sourcePatient->veteran_connected_services,
                'seeking_mat_services' => $sourcePatient->seeking_mat_services,
                'enrolled_mat_services' => $sourcePatient->enrolled_mat_services,
                'arrests_past_12_months' => $sourcePatient->arrests_past_12_months,
                'arrests_lifetime' => $sourcePatient->arrests_lifetime,
                'jail_days_past_12_months' => $sourcePatient->jail_days_past_12_months,
                'jail_days_lifetime' => $sourcePatient->jail_days_lifetime,
                'prison_time_past_12_months' => $sourcePatient->prison_time_past_12_months,
                'prison_time_lifetime' => $sourcePatient->prison_time_lifetime,
            ]);

            $bed->update(['status' => 'occupied']);

            $transfer->update([
                'status' => 'accepted',
                'reviewed_by_user_id' => $user?->id,
                'reviewed_at' => now(),
                'accepted_at' => now(),
                'accepted_patient_id' => $newPatient->id,
                'acceptance_intake_date' => $data['intake_date'],
                'acceptance_bed_id' => $bed->id,
            ]);

            Notification::create([
                'type' => 'admission',
                'message' => "Transfer accepted: {$newPatient->first_name} {$newPatient->last_name}",
                'is_read' => false,
                'facility_id' => $newPatient->facility_id,
                'program_id' => $newPatient->program_id,
            ]);
        });

        return back();
    }

    public function reject(Request $request, PatientTransfer $transfer): RedirectResponse
    {
        $user = $request->user();
        $this->abortIfCannotReviewTransfer($user, $transfer);

        if ($transfer->status !== 'pending') {
            return back()->withErrors(['transfer' => 'Only pending transfer requests can be rejected.']);
        }

        $transfer->update([
            'status' => 'rejected',
            'reviewed_by_user_id' => $user?->id,
            'reviewed_at' => now(),
            'rejected_at' => now(),
        ]);

        return back();
    }

    private function abortIfCannotReviewTransfer($user, PatientTransfer $transfer): void
    {
        if (! $user) {
            abort(403);
        }

        if ($user->is_admin) {
            return;
        }

        if (! $user->facility_id) {
            abort(403);
        }

        abort_unless((int) $transfer->destination_facility_id === (int) $user->facility_id, 403);
    }
}
