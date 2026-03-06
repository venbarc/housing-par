<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFacilityRequest;
use App\Models\Facility;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        $facilities = Facility::query()
            ->visibleTo($user)
            ->with(['rooms' => function ($rooms) use ($user) {
                $rooms->visibleTo($user)->with(['beds' => function ($beds) use ($user) {
                    $beds->visibleTo($user)->with(['patients' => fn ($patients) => $patients->visibleTo($user)]);
                }]);
            }])
            ->orderBy('name')
            ->get();

        return Inertia::render('Facilities/Index', [
            'facilities' => $facilities,
            'programs' => Program::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreFacilityRequest $request): RedirectResponse
    {
        Facility::create($request->validated());

        return back();
    }

    public function update(StoreFacilityRequest $request, Facility $facility): RedirectResponse
    {
        $facility->update($request->validated());

        return back();
    }

    public function destroy(Facility $facility): RedirectResponse
    {
        $facility->delete();

        return back();
    }
}
