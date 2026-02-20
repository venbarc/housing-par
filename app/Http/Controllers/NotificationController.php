<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\RedirectResponse;

class NotificationController extends Controller
{
    public function markAllRead(): RedirectResponse
    {
        Notification::where('is_read', false)->update(['is_read' => true]);

        return redirect()->route('dashboard');
    }

    public function markRead(Notification $notification): RedirectResponse
    {
        $notification->update(['is_read' => true]);

        return redirect()->route('dashboard');
    }

    public function destroy(Notification $notification): RedirectResponse
    {
        $notification->delete();

        return redirect()->route('dashboard');
    }
}
