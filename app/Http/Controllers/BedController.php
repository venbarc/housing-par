<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBedRequest;
use App\Http\Requests\UpdateBedRequest;
use App\Models\Bed;
use App\Models\Notification;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BedController extends Controller
{
    public function store(StoreBedRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (isset($data['patient_id']) && $data['patient_id']) {
            $patient = Patient::findOrFail($data['patient_id']);
            if ($patient->bed_id) {
                return back()->withErrors(['patient_id' => 'Patient already assigned to a bed.']);
            }
        }

        $bed = Bed::create($data);

        if ($bed->patient_id) {
            Patient::where('id', $bed->patient_id)->update(['bed_id' => $bed->id, 'status' => 'occupied']);
            Notification::create(['type' => 'bed_occupied', 'message' => "Bed {$bed->bed_number} assigned to patient", 'is_read' => false]);
        }

        return redirect()->route('dashboard');
    }

    public function update(UpdateBedRequest $request, Bed $bed): RedirectResponse
    {
        $data = $request->validated();

        // Handle patient assignment change
        if (array_key_exists('patient_id', $data)) {
            $newPatientId = $data['patient_id'];
            if ($newPatientId && $newPatientId !== $bed->patient_id) {
                $patient = Patient::find($newPatientId);
                if (! $patient) {
                    return back()->withErrors(['patient_id' => 'Patient not found.']);
                }
                if ($patient->bed_id) {
                    return back()->withErrors(['patient_id' => 'Patient already assigned to another bed.']);
                }
                $patient->update(['bed_id' => $bed->id, 'status' => 'occupied']);
            }
            if ($newPatientId === null && $bed->patient_id) {
                Patient::where('id', $bed->patient_id)->update(['bed_id' => null]);
            }
        }

        $bed->update($data);

        return redirect()->route('dashboard');
    }

    public function destroy(Bed $bed): RedirectResponse
    {
        if ($bed->patient_id) {
            return back()->withErrors(['bed' => 'Cannot delete a bed with an assigned patient.']);
        }
        $bed->delete();

        return redirect()->route('dashboard');
    }

    public function assign(Request $request, Bed $bed): RedirectResponse
    {
        $request->validate(['patient_id' => ['required', 'integer', 'exists:patients,id']]);

        if ($bed->patient_id) {
            return back()->withErrors(['bed' => 'Bed already occupied.']);
        }

        $patient = Patient::findOrFail($request->patient_id);
        if ($patient->bed_id) {
            return back()->withErrors(['patient_id' => 'Patient already assigned to a bed.']);
        }

        $bed->update(['patient_id' => $patient->id, 'status' => 'occupied']);
        $patient->update(['bed_id' => $bed->id, 'status' => 'occupied']);

        Notification::create([
            'type' => 'bed_occupied',
            'message' => "Patient assigned to bed {$bed->bed_number}",
            'is_read' => false,
        ]);

        return redirect()->route('dashboard');
    }

    public function discharge(Bed $bed): RedirectResponse
    {
        if ($bed->patient_id) {
            Patient::where('id', $bed->patient_id)->update(['bed_id' => null, 'status' => 'discharged']);
        }

        $bed->update(['patient_id' => null, 'status' => 'available']);

        Notification::create([
            'type' => 'bed_vacated',
            'message' => "Bed {$bed->bed_number} is now available",
            'is_read' => false,
        ]);

        return redirect()->route('dashboard');
    }

    /** Fire-and-forget AJAX endpoint for canvas drag-and-drop */
    public function updatePosition(Request $request, Bed $bed): JsonResponse
    {
        $data = $request->validate([
            'pos_x' => ['required', 'numeric'],
            'pos_y' => ['required', 'numeric'],
        ]);
        $bed->update($data);

        return response()->json(['id' => $bed->id, 'pos_x' => $bed->pos_x, 'pos_y' => $bed->pos_y]);
    }
}
