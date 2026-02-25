<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWardRequest;
use App\Models\Ward;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Wards/Index', [
            'wards' => Ward::orderBy('name')->get(),
        ]);
    }

    public function store(StoreWardRequest $request): RedirectResponse
    {
        Ward::create($request->validated());

        return back();
    }

    public function update(StoreWardRequest $request, Ward $ward): RedirectResponse
    {
        $ward->update($request->validated());

        return back();
    }

    public function destroy(Ward $ward): RedirectResponse
    {
        $ward->delete();

        return back();
    }
}
