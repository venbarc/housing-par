<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bed_number' => ['sometimes', 'string', 'min:1'],
            'ward_id' => ['sometimes', 'integer', 'exists:wards,id'],
            'room' => ['sometimes', 'string', 'min:1'],
            'status' => ['sometimes', 'in:available,occupied,cleaning,maintenance'],
            'pos_x' => ['sometimes', 'numeric'],
            'pos_y' => ['sometimes', 'numeric'],
            'patient_id' => ['sometimes', 'nullable', 'integer', 'exists:patients,id'],
        ];
    }
}
