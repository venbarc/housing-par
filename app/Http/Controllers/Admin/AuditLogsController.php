<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Facility;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogsController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::query()->orderByDesc('created_at');

        if ($request->filled('action')) {
            $query->where('action', $request->string('action'));
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->input('user_id'));
        }
        if ($request->filled('facility_id')) {
            $query->where('facility_id', (int) $request->input('facility_id'));
        }
        if ($request->filled('program_id')) {
            $query->where('program_id', (int) $request->input('program_id'));
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->string('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->string('date_to'));
        }

        return Inertia::render('Admin/AuditLogs/Index', [
            'filters' => [
                'action' => $request->input('action'),
                'user_id' => $request->input('user_id'),
                'facility_id' => $request->input('facility_id'),
                'program_id' => $request->input('program_id'),
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
            ],
            'audit_logs' => $query->limit(200)->get(),
            'actions' => AuditLog::query()->select('action')->distinct()->orderBy('action')->pluck('action'),
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'facilities' => Facility::query()->orderBy('name')->get(['id', 'name']),
            'programs' => Program::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }
}

