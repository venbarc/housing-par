<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Models\Document;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Bed;
use App\Support\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class DocumentController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        return Inertia::render('Documents/Index', [
            'documents' => Document::query()->visibleTo($user)->orderByDesc('uploaded_at')->get(),
            'patients' => Patient::query()->visibleTo($user)->orderBy('last_name')->orderBy('first_name')->get(),
            'beds' => Bed::query()->visibleTo($user)->orderBy('bed_number')->get(),
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $data = $request->validated();
        $patientId = $data['patient_id'] ?? null;
        $bedId = $data['bed_id'] ?? null;
        $user = $request->user();

        $basePath = $patientId ? "patients/{$patientId}/documents" : "beds/{$bedId}/documents";
        $path = $file->store($basePath, 's3');
        $url = Storage::disk('s3')->url($path);

        $facilityId = null;
        $programId = null;

        if ($patientId) {
            $patient = Patient::query()->visibleTo($user)->find($patientId);
            if (! $patient) {
                return back()->withErrors(['patient_id' => 'Patient not found.']);
            }
            $facilityId = $patient->facility_id;
            $programId = $patient->program_id;
        } elseif ($bedId) {
            $bed = Bed::query()->visibleTo($user)->with('room')->find($bedId);
            if (! $bed) {
                return back()->withErrors(['bed_id' => 'Bed not found.']);
            }
            $facilityId = $bed->room?->facility_id;
            $programId = $bed->room?->program_id;
        }

        if (! $facilityId || ! $programId) {
            $pair = Tenant::pair($user);
            $facilityId = $pair['facility_id'] ?? null;
            $programId = $pair['program_id'] ?? (Tenant::programIds($user)[0] ?? null);
        }

        if (! $facilityId || ! $programId) {
            $facilityId = DB::table('facilities')->where('name', 'Default Facility')->value('id')
                ?? DB::table('facilities')->orderBy('id')->value('id');
            $programId = DB::table('programs')->where('name', 'Navigation Center Info')->value('id')
                ?? DB::table('programs')->orderBy('id')->value('id');
        }

        $document = Document::create([
            'patient_id' => $patientId,
            'bed_id' => $bedId,
            'facility_id' => $facilityId,
            'program_id' => $programId,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'storage_path' => $path,
            'file_url' => $url,
            'uploaded_at' => now(),
        ]);

        Notification::create([
            'type' => 'doc_uploaded',
            'message' => "Document uploaded: {$document->file_name}",
            'is_read' => false,
            'facility_id' => $facilityId,
            'program_id' => $programId,
        ]);

        return back();
    }

    public function destroy(Document $document): RedirectResponse
    {
        Tenant::abortIfCannotAccessDocument(request()->user(), $document);

        Storage::disk('s3')->delete($document->storage_path);
        $document->delete();

        return back();
    }
}
