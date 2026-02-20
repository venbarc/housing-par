<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1'],
            'age' => ['required', 'integer', 'min:0'],
            'gender' => ['required', 'string'],
            'diagnosis' => ['required', 'string'],
            'status' => ['required', 'in:stable,critical,recovering,discharged'],
            'doctor' => ['required', 'string'],
            'admission_date' => ['required', 'date'],
            'contact' => ['required', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'bed_id' => ['sometimes', 'nullable', 'integer', 'exists:beds,id'],
        ];
    }
}
