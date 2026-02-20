<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bed_number' => ['required', 'string', 'min:1'],
            'ward_id' => ['required', 'integer', 'exists:wards,id'],
            'room' => ['required', 'string', 'min:1'],
            'status' => ['required', 'in:available,occupied,cleaning,maintenance'],
            'pos_x' => ['sometimes', 'numeric'],
            'pos_y' => ['sometimes', 'numeric'],
            'patient_id' => ['sometimes', 'nullable', 'integer', 'exists:patients,id'],
        ];
    }
}
