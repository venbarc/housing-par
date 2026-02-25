<?php

namespace App\Http\Controllers;

use App\Models\Bed;
use App\Models\Document;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Ward;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'beds' => Bed::with('patient')->orderBy('bed_number')->get(),
            'patients' => Patient::orderBy('name')->get(),
            'wards' => Ward::orderBy('name')->get(),
            'documents' => Document::orderByDesc('uploaded_at')->limit(40)->get(),
            'notifications' => Notification::orderByDesc('created_at')->limit(80)->get(),
        ]);
    }
}
