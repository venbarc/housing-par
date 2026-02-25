<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => Notification::orderByDesc('created_at')->limit(200)->get(),
        ]);
    }

    public function markAllRead(): RedirectResponse
    {
        Notification::where('is_read', false)->update(['is_read' => true]);

        return back();
    }

    public function markRead(Notification $notification): RedirectResponse
    {
        $notification->update(['is_read' => true]);

        return back();
    }

    public function destroy(Notification $notification): RedirectResponse
    {
        $notification->delete();

        return back();
    }
}
