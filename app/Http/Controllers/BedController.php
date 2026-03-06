<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBedRequest;
use App\Http\Requests\UpdateBedRequest;
use App\Models\Bed;
use App\Models\Facility;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\PatientTransfer;
use App\Models\Program;
use App\Models\Room;
use App\Models\Document;
use App\Support\Tenant;
use App\Support\DischargeOptions;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BedController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        return Inertia::render('Beds/Index', [
            'beds' => Bed::query()
                ->visibleTo($user)
                ->with(['patients', 'room.facility', 'room.program'])
                ->orderBy('bed_number')
                ->get(),
            'patients' => Patient::query()
                ->visibleTo($user)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get(),
            'rooms' => Room::query()
                ->visibleTo($user)
                ->with(['facility', 'program'])
                ->orderBy('name')
                ->get(),
            'facilities' => Facility::query()
                ->visibleTo($user)
                ->with(['rooms' => fn ($q) => $q->visibleTo($user)])
                ->orderBy('name')
                ->get(),
            'programs' => Program::query()->orderBy('name')->get(['id', 'name']),
            'transfer_facilities' => Facility::query()->orderBy('name')->get(['id', 'name']),
            'transfer_programs' => Program::query()->orderBy('name')->get(['id', 'name']),
            'transfer_pairs' => Room::query()
                ->select(['facility_id', 'program_id'])
                ->distinct()
                ->get(),
            'documents' => Document::query()
                ->visibleTo($user)
                ->orderByDesc('uploaded_at')
                ->get(),
            'discharge_options' => DischargeOptions::map(),
        ]);
    }

    public function store(StoreBedRequest $request): RedirectResponse
    {
        Bed::create($request->validated());

        return back();
    }

    public function update(UpdateBedRequest $request, Bed $bed): RedirectResponse
    {
        $bed->update($request->validated());

        return back();
    }

    public function destroy(Bed $bed): RedirectResponse
    {
        Tenant::abortIfCannotAccessBed(request()->user(), $bed);

        $patientCount = Patient::where('bed_id', $bed->id)->count();
        if ($patientCount > 0) {
            return back()->withErrors(['bed' => 'Cannot delete a bed with assigned patients.']);
        }
        $bed->delete();

        return back();
    }

    public function discharge(Request $request, Bed $bed): RedirectResponse
    {
        Tenant::abortIfCannotAccessBed($request->user(), $bed);

        $data = $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'discharge_disposition' => ['required', 'string'],
            'discharge_destination' => ['required', 'string'],
            'leave_details' => ['required', 'string'],
            'is_move' => ['sometimes', 'boolean'],
            'destination_facility_id' => ['required_if:is_move,true', 'nullable', 'integer', 'exists:facilities,id'],
            'destination_program_id' => ['required_if:is_move,true', 'nullable', 'integer', 'exists:programs,id'],
        ]);

        if (! DischargeOptions::isValid($data['discharge_disposition'], $data['discharge_destination'])) {
            return back()->withErrors([
                'discharge_destination' => 'The selected destination is not valid for the selected disposition.',
            ]);
        }

        $patient = Patient::where('id', $data['patient_id'])
            ->where('bed_id', $bed->id)
            ->first();

        if (! $patient) {
            return back()->withErrors(['patient_id' => 'Patient is not assigned to this bed.']);
        }

        $isMove = (bool) ($data['is_move'] ?? false);
        $destinationFacilityId = $isMove ? (int) $data['destination_facility_id'] : null;
        $destinationProgramId = $isMove ? (int) $data['destination_program_id'] : null;

        if ($isMove && $destinationFacilityId === (int) $patient->facility_id && $destinationProgramId === (int) $patient->program_id) {
            return back()->withErrors([
                'destination_program_id' => 'Destination Location/Program must differ from the current assignment.',
            ]);
        }

        if ($isMove) {
            $validPair = Room::query()
                ->where('facility_id', $destinationFacilityId)
                ->where('program_id', $destinationProgramId)
                ->exists();

            if (! $validPair) {
                return back()->withErrors([
                    'destination_program_id' => 'Destination Location/Program combination is not valid.',
                ]);
            }
        }

        $sourceRoom = $bed->room()->select(['facility_id', 'program_id'])->first();
        $sourceFacilityId = (int) ($patient->facility_id ?: ($sourceRoom?->facility_id ?? 0));
        $sourceProgramId = (int) ($patient->program_id ?: ($sourceRoom?->program_id ?? 0));

        if ($isMove && (! $sourceFacilityId || ! $sourceProgramId)) {
            return back()->withErrors([
                'transfer' => 'Cannot create transfer: source Location/Program is missing.',
            ]);
        }

        DB::transaction(function () use ($patient, $bed, $request, $data, $isMove, $destinationFacilityId, $destinationProgramId, $sourceFacilityId, $sourceProgramId) {
            $patient->update([
                'facility_id' => $sourceFacilityId ?: $patient->facility_id,
                'program_id' => $sourceProgramId ?: $patient->program_id,
                'bed_id' => null,
                'discharged_bed_id' => $bed->id,
                'discharged_at' => now(),
                'discharge_disposition' => $data['discharge_disposition'],
                'discharge_destination' => $data['discharge_destination'],
                'leave_details' => $data['leave_details'],
                'move_to_facility_id' => $destinationFacilityId,
                'move_to_program_id' => $destinationProgramId,
            ]);

            $bed->update(['status' => 'available']);

            if ($isMove) {
                PatientTransfer::create([
                    'source_patient_id' => $patient->id,
                    'source_bed_id' => $bed->id,
                    'source_facility_id' => $sourceFacilityId,
                    'source_program_id' => $sourceProgramId,
                    'destination_facility_id' => $destinationFacilityId,
                    'destination_program_id' => $destinationProgramId,
                    'status' => 'pending',
                    'requested_by_user_id' => $request->user()?->id,
                    'requested_at' => now(),
                ]);
            }
        });

        $tenant = [
            'facility_id' => $patient->facility_id,
            'program_id' => $patient->program_id,
        ];

        Notification::create([
            'type' => 'bed_vacated',
            'message' => "Patient {$patient->first_name} {$patient->last_name} discharged from bed {$bed->bed_number}",
            'is_read' => false,
            ...$tenant,
        ]);

        return back();
    }
}
