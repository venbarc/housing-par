<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
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

        if (! $user->facility_id) {
            return false;
        }

        $facilityId = (int) $this->input('facility_id');
        return $facilityId === (int) $user->facility_id;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'facility_id' => ['required', 'integer', 'exists:facilities,id'],
            'program_id' => ['required', 'integer', 'exists:programs,id'],
        ];
    }
}
