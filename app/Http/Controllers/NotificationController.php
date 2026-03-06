<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Support\Tenant;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        return Inertia::render('Notifications/Index', [
            'notifications' => Notification::query()
                ->visibleTo($user)
                ->orderByDesc('created_at')
                ->limit(200)
                ->get(),
        ]);
    }

    public function markAllRead(): RedirectResponse
    {
        $user = request()->user();
        Notification::query()
            ->visibleTo($user)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back();
    }

    public function markRead(Notification $notification): RedirectResponse
    {
        Tenant::abortIfCannotAccessNotification(request()->user(), $notification);
        $notification->update(['is_read' => true]);

        return back();
    }

    public function destroy(Notification $notification): RedirectResponse
    {
        Tenant::abortIfCannotAccessNotification(request()->user(), $notification);
        $notification->delete();

        return back();
    }
}
