<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Models\Document;
use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $patientId = $request->validated()['patient_id'];

        $path = $file->store("patients/{$patientId}/documents", 's3');
        $url = Storage::disk('s3')->url($path);

        $document = Document::create([
            'patient_id' => $patientId,
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

        return redirect()->route('dashboard');
    }

    public function destroy(Document $document): RedirectResponse
    {
        Storage::disk('s3')->delete($document->storage_path);
        $document->delete();

        return redirect()->route('dashboard');
    }
}
