<?php

namespace App\Http\Controllers;

use App\Models\Bed;
use App\Models\Document;
use App\Models\Facility;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Room;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'beds' => Bed::with(['patients', 'room.facility'])->orderBy('bed_number')->get(),
            'patients' => Patient::orderBy('last_name')->orderBy('first_name')->get(),
            'rooms' => Room::with('facility')->orderBy('name')->get(),
            'facilities' => Facility::with('rooms.beds.patients')->orderBy('name')->get(),
            'documents' => Document::orderByDesc('uploaded_at')->limit(40)->get(),
            'notifications' => Notification::orderByDesc('created_at')->limit(80)->get(),
        ]);
    }
}
