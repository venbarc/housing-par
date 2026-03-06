<?php

namespace App\Http\Controllers;

use App\Models\Bed;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $filters = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $bedCounts = Bed::query()
            ->visibleTo($user)
            ->selectRaw('status, COUNT(*) AS count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Reports/Index', [
            'filters' => [
                'from' => $filters['from'] ?? null,
                'to' => $filters['to'] ?? null,
            ],
            'bed_counts' => [
                'occupied' => (int) ($bedCounts['occupied'] ?? 0),
                'available' => (int) ($bedCounts['available'] ?? 0),
                'maintenance' => (int) ($bedCounts['maintenance'] ?? 0),
            ],
            'discharges' => Patient::query()
                ->visibleTo($user)
                ->with(['dischargedBed.room.facility', 'dischargedBed.room.program'])
                ->whereNotNull('discharged_at')
                ->when($filters['from'] ?? null, function ($q, $from) {
                    $start = Carbon::createFromFormat('Y-m-d', $from)->startOfDay();
                    $q->where('discharged_at', '>=', $start);
                })
                ->when($filters['to'] ?? null, function ($q, $to) {
                    $end = Carbon::createFromFormat('Y-m-d', $to)->endOfDay();
                    $q->where('discharged_at', '<=', $end);
                })
                ->orderByDesc('discharged_at')
                ->get(),
        ]);
    }

    public function exportBeds(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'status' => ['required', Rule::in(['occupied', 'available', 'maintenance'])],
        ]);

        $status = $validated['status'];

        $beds = Bed::query()
            ->visibleTo($user)
            ->where('status', $status)
            ->with(['room.facility', 'room.program', 'patients'])
            ->orderBy('room_id')
            ->orderBy('bed_number')
            ->get();

        $filename = "beds_{$status}_" . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () use ($beds) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Bed ID', 'Bed Number', 'Bed Type', 'Status', 'Room', 'Location', 'Program', 'Patients']);

            foreach ($beds as $bed) {
                $patients = $bed->patients->map(fn ($p) => "{$p->first_name} {$p->last_name}")->implode('; ');
                fputcsv($out, [
                    $bed->id,
                    $bed->bed_number,
                    $bed->bed_type,
                    $bed->status,
                    $bed->room?->name,
                    $bed->room?->facility?->name,
                    $bed->room?->program?->name,
                    $patients,
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function exportDischarges(Request $request)
    {
        $user = $request->user();

        $filters = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $query = Patient::query()
            ->visibleTo($user)
            ->with(['dischargedBed.room.facility', 'dischargedBed.room.program'])
            ->whereNotNull('discharged_at')
            ->orderByDesc('discharged_at');

        if (! empty($filters['from'])) {
            $start = Carbon::createFromFormat('Y-m-d', $filters['from'])->startOfDay();
            $query->where('discharged_at', '>=', $start);
        }

        if (! empty($filters['to'])) {
            $end = Carbon::createFromFormat('Y-m-d', $filters['to'])->endOfDay();
            $query->where('discharged_at', '<=', $end);
        }

        $patients = $query->get();

        $suffix = now()->format('Y-m-d_His');
        $filename = "discharges_{$suffix}.csv";

        return response()->streamDownload(function () use ($patients) {
            $out = fopen('php://output', 'w');
            fputcsv($out, [
                'Discharged At',
                'First Name',
                'Last Name',
                'DOB',
                'Status',
                'Referral From',
                'Insurance',
                'Intake Date',
                'Discharge Date',
                'Discharged From',
                'Location',
                'Program',
            ]);

            foreach ($patients as $patient) {
                $bed = $patient->dischargedBed;
                $room = $bed?->room;

                $dischargedFrom = $bed
                    ? (($room?->name ?? 'Rm ?') . " • {$bed->bed_number}")
                    : ($patient->discharged_bed_id ? "Bed {$patient->discharged_bed_id}" : null);

                fputcsv($out, [
                    optional($patient->discharged_at)->toISOString(),
                    $patient->first_name,
                    $patient->last_name,
                    optional($patient->dob)->format('Y-m-d'),
                    $patient->status,
                    $patient->referral_from,
                    $patient->insurance,
                    optional($patient->intake_date)->format('Y-m-d'),
                    optional($patient->discharge_date)->format('Y-m-d'),
                    $dischargedFrom,
                    $room?->facility?->name,
                    $room?->program?->name,
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
