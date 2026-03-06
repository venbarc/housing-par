<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Bed;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Room;
use App\Support\Tenant;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        return Inertia::render('Patients/Index', [
            'patients' => Patient::query()
                ->visibleTo($user)
                ->with('bed.room.facility')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get(),
            'beds' => Bed::query()
                ->visibleTo($user)
                ->with(['patients', 'room.facility', 'room.program'])
                ->orderBy('bed_number')
                ->get(),
        ]);
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $bedId = $data['bed_id'] ?? null;
        if ($bedId) {
            $bed = Bed::query()->visibleTo($user)->withCount('patients')->find($bedId);
            if (! $bed) {
                return back()->withErrors(['bed_id' => 'Bed not found.']);
            }
            if ($bed->status === 'maintenance') {
                return back()->withErrors(['bed_id' => 'Bed is under maintenance.']);
            }
            if ($bed->patients_count > 0) {
                return back()->withErrors(['bed_id' => 'Bed is already occupied.']);
            }
        }

        $facilityId = null;
        $programId = null;

        if ($bedId) {
            $room = $bed->room()->select(['facility_id', 'program_id'])->first();
            $facilityId = $room?->facility_id;
            $programId = $room?->program_id;
        } else {
            $pair = Tenant::pair($user);
            $facilityId = $pair['facility_id'] ?? null;
            $programId = $pair['program_id'] ?? (Tenant::programIds($user)[0] ?? null);
        }

        if (! $facilityId || ! $programId) {
            $facilityId = DB::table('facilities')->where('name', 'Default Facility')->value('id')
                ?? DB::table('facilities')->orderBy('id')->value('id');
            $programId = DB::table('programs')->where('name', 'Navigation Center Info')->value('id')
                ?? DB::table('programs')->orderBy('id')->value('id');
        }

        $data['facility_id'] = $facilityId;
        $data['program_id'] = $programId;

        $patient = Patient::create($data);

        if ($patient->bed_id) {
            Bed::where('id', $patient->bed_id)->update(['status' => 'occupied']);
        }

        Notification::create([
            'type' => 'admission',
            'message' => "New intake: {$patient->first_name} {$patient->last_name}",
            'is_read' => false,
            'facility_id' => $patient->facility_id,
            'program_id' => $patient->program_id,
        ]);

        return back();
    }

    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        Tenant::abortIfCannotAccessPatient($request->user(), $patient);

        $data = $request->validated();
        $user = $request->user();

        if (array_key_exists('bed_id', $data)) {
            $newBedId = $data['bed_id'];
            $oldBedId = $patient->bed_id;

            if ($newBedId && $newBedId !== $oldBedId) {
                $bed = Bed::query()->visibleTo($user)->withCount('patients')->find($newBedId);
                if (! $bed) {
                    return back()->withErrors(['bed_id' => 'Bed not found.']);
                }
                if ($bed->status === 'maintenance') {
                    return back()->withErrors(['bed_id' => 'Bed is under maintenance.']);
                }
                if ($bed->patients_count > 0) {
                    return back()->withErrors(['bed_id' => 'Bed is already occupied.']);
                }

                $room = $bed->room()->select(['facility_id', 'program_id'])->first();
                if ($room) {
                    $data['facility_id'] = $room->facility_id;
                    $data['program_id'] = $room->program_id;
                }
            }

            // Free old bed if changing/unassigning.
            if ($oldBedId && $newBedId !== $oldBedId) {
                Bed::where('id', $oldBedId)->update(['status' => 'available']);
            }
        }

        $patient->update($data);

        // Update new bed status if bed changed
        if (isset($newBedId) && $newBedId && $newBedId !== $oldBedId) {
            Bed::where('id', $newBedId)->update(['status' => 'occupied']);
        }

        return back();
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        Tenant::abortIfCannotAccessPatient(request()->user(), $patient);

        $bedId = $patient->bed_id;
        $patient->delete();

        if ($bedId) {
            $remainingCount = Patient::where('bed_id', $bedId)->count();
            $bed = Bed::find($bedId);
            if ($bed) {
                if ($remainingCount === 0) {
                    $bed->update(['status' => 'available']);
                }
            }
        }

        return back();
    }
}
