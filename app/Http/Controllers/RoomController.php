<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Models\Facility;
use App\Models\Program;
use App\Models\Room;
use App\Support\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        return Inertia::render('Rooms/Index', [
            'rooms' => Room::query()
                ->visibleTo($user)
                ->with(['beds.patients'])
                ->orderBy('name')
                ->get(),
            'facilities' => $user && $user->is_admin
                ? Facility::query()->orderBy('name')->get(['id', 'name'])
                : Facility::query()->where('id', $user?->facility_id)->get(['id', 'name']),
            'programs' => Program::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreRoomRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (! $request->user()->is_admin) {
            $pair = Tenant::pair($request->user());
            $data['facility_id'] = $pair['facility_id'];
        }

        Room::create($data);

        return back();
    }

    public function update(StoreRoomRequest $request, Room $room): RedirectResponse
    {
        Tenant::abortIfCannotAccessRoom($request->user(), $room);

        $data = $request->validated();

        if (! $request->user()->is_admin) {
            $pair = Tenant::pair($request->user());
            $data['facility_id'] = $pair['facility_id'];
        }

        $room->update($data);

        return back();
    }

    public function destroy(Room $room): RedirectResponse
    {
        Tenant::abortIfCannotAccessRoom(request()->user(), $room);
        $room->delete();

        return back();
    }
}
