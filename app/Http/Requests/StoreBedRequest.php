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
            'bed_type' => ['required', 'in:single,ada_single,double_top,double_bottom'],
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'status' => ['required', 'in:available,occupied,cleaning,maintenance'],
        ];
    }
}
