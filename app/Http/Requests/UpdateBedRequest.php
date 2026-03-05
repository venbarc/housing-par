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
            'bed_type' => ['sometimes', 'in:single,ada_single,double_top,double_bottom'],
            'room_id' => ['sometimes', 'integer', 'exists:rooms,id'],
            'status' => ['sometimes', 'in:available,occupied,cleaning,maintenance'],
        ];
    }
}
