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
            'patients' => Patient::orderBy('name')->get(),
            'beds' => Bed::with('patient')->orderBy('bed_number')->get(),
        ]);
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (isset($data['bed_id']) && $data['bed_id']) {
            $bed = Bed::find($data['bed_id']);
            if (! $bed) {
                return back()->withErrors(['bed_id' => 'Bed not found.']);
            }
            if ($bed->patient_id) {
                return back()->withErrors(['bed_id' => 'Bed already occupied.']);
            }
        }

        $patient = Patient::create($data);

        if ($patient->bed_id) {
            Bed::where('id', $patient->bed_id)->update(['patient_id' => $patient->id, 'status' => 'occupied']);
        }

        Notification::create([
            'type' => 'admission',
            'message' => "New patient admitted: {$patient->name}",
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
                $bed = Bed::find($newBedId);
                if (! $bed) {
                    return back()->withErrors(['bed_id' => 'Bed not found.']);
                }
                if ($bed->patient_id && $bed->patient_id !== $patient->id) {
                    return back()->withErrors(['bed_id' => 'Bed already occupied.']);
                }
                // Free old bed
                if ($oldBedId) {
                    Bed::where('id', $oldBedId)->update(['patient_id' => null, 'status' => 'available']);
                }
                // Assign new bed
                $bed->update(['patient_id' => $patient->id, 'status' => 'occupied']);
            }

            if ($newBedId === null && $oldBedId) {
                Bed::where('id', $oldBedId)->update(['patient_id' => null, 'status' => 'available']);
            }
        }

        $patient->update($data);

        return back();
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        if ($patient->bed_id) {
            Bed::where('id', $patient->bed_id)->update(['patient_id' => null, 'status' => 'available']);
        }
        $patient->delete();

        return back();
    }
}
