<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['nullable', 'integer', 'exists:patients,id'],
            'bed_id' => ['nullable', 'integer', 'exists:beds,id'],
            'file' => ['required', 'file', 'max:20480', 'mimes:doc,docx,pdf'], // 20 MB
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $patientId = $this->input('patient_id');
            $bedId = $this->input('bed_id');
            if (!$patientId && !$bedId) {
                $validator->errors()->add('patient_id', 'Provide either patient_id or bed_id.');
            }
        });
    }
}
