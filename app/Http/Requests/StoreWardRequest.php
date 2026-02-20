<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1'],
            'floor' => ['sometimes', 'nullable', 'string'],
            'description' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
