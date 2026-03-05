<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'facility_id' => ['required', 'integer', 'exists:facilities,id'],
        ];
    }
}
