<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Rooms/Index', [
            'rooms' => Room::with('beds.patients')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreRoomRequest $request): RedirectResponse
    {
        Room::create($request->validated());

        return back();
    }

    public function update(StoreRoomRequest $request, Room $room): RedirectResponse
    {
        $room->update($request->validated());

        return back();
    }

    public function destroy(Room $room): RedirectResponse
    {
        $room->delete();

        return back();
    }
}
