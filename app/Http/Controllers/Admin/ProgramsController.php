<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgramsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Programs/Index', [
            'programs' => Program::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:1', 'max:255', 'unique:programs,name'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        Program::create($data);

        return back()->with('message', 'Program created.');
    }

    public function update(Request $request, Program $program): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:1', 'max:255', 'unique:programs,name,'.$program->id],
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $program->update($data);

        return back()->with('message', 'Program updated.');
    }

    public function destroy(Program $program): RedirectResponse
    {
        $program->delete();

        return back()->with('message', 'Program deleted.');
    }
}

