<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Program;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::query()
                ->with('programs:id')
                ->orderBy('name')
                ->orderBy('email')
                ->get(['id', 'name', 'email', 'is_admin', 'can_login', 'facility_id', 'program_id', 'created_at'])
                ->map(function (User $user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'is_admin' => (bool) $user->is_admin,
                        'can_login' => (bool) ($user->can_login ?? true),
                        'facility_id' => $user->facility_id,
                        'program_id' => $user->program_id,
                        'program_ids' => $user->programs->pluck('id')->values(),
                        'created_at' => $user->created_at,
                    ];
                }),
            'facilities' => Facility::query()->orderBy('name')->get(['id', 'name']),
            'programs' => Program::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function updateAssignment(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'facility_id' => ['nullable', 'integer', 'exists:facilities,id'],
            'program_ids' => ['sometimes', 'array'],
            'program_ids.*' => ['integer', 'exists:programs,id'],
            'can_login' => ['sometimes', 'boolean'],
        ]);

        if ((int) $request->user()?->id === (int) $user->id && array_key_exists('can_login', $data) && ! $data['can_login']) {
            return back()->withErrors(['can_login' => 'You cannot disable login for your own account.']);
        }

        $old = array_merge(
            $user->only(['facility_id', 'program_id', 'can_login']),
            ['program_ids' => $user->programs()->pluck('programs.id')->all()]
        );

        $programIds = array_values(array_unique(array_map('intval', $data['program_ids'] ?? [])));

        $payload = [
            'facility_id' => array_key_exists('facility_id', $data) && $data['facility_id'] !== null ? (int) $data['facility_id'] : null,
            'program_id' => ! empty($programIds) ? (int) $programIds[0] : null,
            'can_login' => array_key_exists('can_login', $data) ? (bool) $data['can_login'] : (bool) ($user->can_login ?? true),
        ];

        if (! $user->is_admin && $payload['can_login'] && ! $payload['facility_id']) {
            return back()->withErrors(['facility_id' => 'Non-admin users must have a Location to log in.']);
        }

        $user->update($payload);
        $user->programs()->sync($programIds);

        $new = array_merge($payload, ['program_ids' => $programIds]);
        AuditLogger::log('assigned', $user, $old, $new, $payload['facility_id'], $payload['program_id']);

        return back()->with('message', 'User assignment updated.');
    }

    public function updateAdmin(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'is_admin' => ['required', 'boolean'],
        ]);

        $old = $user->only(['is_admin']);
        $user->update([
            'is_admin' => (bool) $data['is_admin'],
        ]);
        AuditLogger::log('role_updated', $user, $old, ['is_admin' => (bool) $data['is_admin']], $user->facility_id, $user->program_id);

        return back()->with('message', 'User role updated.');
    }
}
