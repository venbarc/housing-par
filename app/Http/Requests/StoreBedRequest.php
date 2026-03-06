<?php

namespace App\Http\Requests;

use App\Models\Room;
use App\Support\Tenant;
use Illuminate\Foundation\Http\FormRequest;

class StoreBedRequest extends FormRequest
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

        $roomId = $this->input('room_id');
        if (! $roomId) {
            return false;
        }

        $programIds = Tenant::programIds($user);
        if (empty($programIds)) {
            return false;
        }

        return Room::query()
            ->where('id', $roomId)
            ->where('facility_id', $pair['facility_id'])
            ->whereIn('program_id', $programIds)
            ->exists();
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
