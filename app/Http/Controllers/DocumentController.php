<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Models\Document;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Bed;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Documents/Index', [
            'documents' => Document::orderByDesc('uploaded_at')->get(),
            'patients' => Patient::orderBy('name')->get(),
            'beds' => Bed::orderBy('bed_number')->get(),
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $data = $request->validated();
        $patientId = $data['patient_id'] ?? null;
        $bedId = $data['bed_id'] ?? null;

        $basePath = $patientId ? "patients/{$patientId}/documents" : "beds/{$bedId}/documents";
        $path = $file->store($basePath, 's3');
        $url = Storage::disk('s3')->url($path);

        $document = Document::create([
            'patient_id' => $patientId,
            'bed_id' => $bedId,
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
        ]);

        return back();
    }

    public function destroy(Document $document): RedirectResponse
    {
        Storage::disk('s3')->delete($document->storage_path);
        $document->delete();

        return back();
    }
}
