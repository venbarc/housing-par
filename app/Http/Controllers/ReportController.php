<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Reports/Index', [
            'discharges' => Patient::with(['dischargedBed.room.facility'])
                ->whereNotNull('discharged_at')
                ->orderByDesc('discharged_at')
                ->get(),
        ]);
    }
}

