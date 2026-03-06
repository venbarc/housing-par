<?php

namespace App\Http\Requests;

use App\Models\Bed;
use App\Models\Patient;
use App\Support\Tenant;
use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        if ($user->is_admin) {
            return true;
        }

        $pair = Tenant::pair($user);
        if (! $pair) {
            return false;
        }

        $programIds = Tenant::programIds($user);
        if (empty($programIds)) {
            return false;
        }

        $patientId = $this->input('patient_id');
        $bedId = $this->input('bed_id');

        if ($patientId) {
            return Patient::query()
                ->where('id', $patientId)
                ->where('facility_id', $pair['facility_id'])
                ->where(function ($q) use ($programIds) {
                    $q->whereIn('program_id', $programIds)->orWhereNull('program_id');
                })
                ->exists();
        }

        if ($bedId) {
            return Bed::query()
                ->where('id', $bedId)
                ->whereHas('room', function ($q) use ($pair, $programIds) {
                    $q->where('facility_id', $pair['facility_id'])->whereIn('program_id', $programIds);
                })
                ->exists();
        }

        return false;
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
            if (! $patientId && ! $bedId) {
                $validator->errors()->add('patient_id', 'Provide either patient_id or bed_id.');
            }
        });
    }
}
