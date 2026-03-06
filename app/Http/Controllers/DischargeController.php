<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DischargeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $filters = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        return Inertia::render('Discharges/Index', [
            'filters' => [
                'from' => $filters['from'] ?? null,
                'to' => $filters['to'] ?? null,
            ],
            'discharges' => Patient::query()
                ->visibleTo($user)
                ->with([
                    'dischargedBed.room.facility',
                    'dischargedBed.room.program',
                    'moveToFacility:id,name',
                    'moveToProgram:id,name',
                ])
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
}
