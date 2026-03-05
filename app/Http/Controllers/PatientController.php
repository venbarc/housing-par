<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Bed;
use App\Models\Notification;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Patients/Index', [
            'patients' => Patient::with('bed.room.facility')->orderBy('last_name')->orderBy('first_name')->get(),
            'beds' => Bed::with(['patients', 'room.facility'])->orderBy('bed_number')->get(),
        ]);
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $bedId = $data['bed_id'] ?? null;
        if ($bedId) {
            $bed = Bed::withCount('patients')->find($bedId);
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

        $patient = Patient::create($data);

        if ($patient->bed_id) {
            Bed::where('id', $patient->bed_id)->update(['status' => 'occupied']);
        }

        Notification::create([
            'type' => 'admission',
            'message' => "New intake: {$patient->first_name} {$patient->last_name}",
            'is_read' => false,
        ]);

        return back();
    }

    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        $data = $request->validated();

        if (array_key_exists('bed_id', $data)) {
            $newBedId = $data['bed_id'];
            $oldBedId = $patient->bed_id;

            if ($newBedId && $newBedId !== $oldBedId) {
                $bed = Bed::withCount('patients')->find($newBedId);
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
