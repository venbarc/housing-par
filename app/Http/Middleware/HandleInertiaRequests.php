<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing([
                'facility:id,name',
                'program:id,name',
                'programs:id,name',
            ]);

            $user->setAttribute('program_ids', $user->programs->pluck('id')->values());
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'unread_notifications' => $request->user()
                    ? Notification::query()->visibleTo($request->user())->where('is_read', false)->count()
                    : 0,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'import_result' => fn () => $request->session()->get('import_result'),
            ],
        ];
    }
}
