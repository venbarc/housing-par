<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWardRequest;
use App\Models\Ward;
use Illuminate\Http\RedirectResponse;

class WardController extends Controller
{
    public function store(StoreWardRequest $request): RedirectResponse
    {
        Ward::create($request->validated());

        return redirect()->route('dashboard');
    }

    public function update(StoreWardRequest $request, Ward $ward): RedirectResponse
    {
        $ward->update($request->validated());

        return redirect()->route('dashboard');
    }

    public function destroy(Ward $ward): RedirectResponse
    {
        $ward->delete();

        return redirect()->route('dashboard');
    }
}
