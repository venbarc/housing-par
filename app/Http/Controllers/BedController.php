<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBedRequest;
use App\Http\Requests\UpdateBedRequest;
use App\Models\Bed;
use App\Models\Facility;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Room;
use App\Models\Document;
use App\Support\Tenant;
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
            'documents' => Document::query()
                ->visibleTo($user)
                ->orderByDesc('uploaded_at')
                ->get(),
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

        $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
        ]);

        $patient = Patient::where('id', $request->patient_id)
            ->where('bed_id', $bed->id)
            ->first();

        if (! $patient) {
            return back()->withErrors(['patient_id' => 'Patient is not assigned to this bed.']);
        }

        $patient->update([
            'bed_id' => null,
            'discharged_bed_id' => $bed->id,
            'discharged_at' => now(),
        ]);

        $bed->update(['status' => 'available']);

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
