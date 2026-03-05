<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFacilityRequest;
use App\Models\Facility;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function index(): Response
    {
        $facilities = Facility::with('rooms.beds.patients')->orderBy('name')->get();

        return Inertia::render('Facilities/Index', [
            'facilities' => $facilities,
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
