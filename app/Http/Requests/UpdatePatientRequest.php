<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'min:1'],
            'age' => ['sometimes', 'integer', 'min:0'],
            'gender' => ['sometimes', 'string'],
            'diagnosis' => ['sometimes', 'string'],
            'status' => ['sometimes', 'in:stable,critical,recovering,discharged'],
            'doctor' => ['sometimes', 'string'],
            'admission_date' => ['sometimes', 'date'],
            'contact' => ['sometimes', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'bed_id' => ['sometimes', 'nullable', 'integer', 'exists:beds,id'],
        ];
    }
}
