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
        $user = request()->user();

        return Inertia::render('Dashboard', [
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
                ->with(['rooms' => function ($rooms) use ($user) {
                    $rooms->visibleTo($user)->with(['beds' => function ($beds) use ($user) {
                        $beds->visibleTo($user)->with(['patients' => fn ($patients) => $patients->visibleTo($user)]);
                    }]);
                }])
                ->orderBy('name')
                ->get(),
            'documents' => Document::query()
                ->visibleTo($user)
                ->orderByDesc('uploaded_at')
                ->limit(40)
                ->get(),
            'notifications' => Notification::query()
                ->visibleTo($user)
                ->orderByDesc('created_at')
                ->limit(80)
                ->get(),
        ]);
    }
}
