<?php

namespace App\Http\Requests;

use App\Models\Bed;
use App\Models\Room;
use App\Support\Tenant;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBedRequest extends FormRequest
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

        /** @var Bed|null $bed */
        $bed = $this->route('bed');
        if (! $bed) {
            return false;
        }

        $bedRoom = $bed->room()->select(['facility_id', 'program_id'])->first();
        if (! $bedRoom) {
            return false;
        }

        $programIds = Tenant::programIds($user);
        if (empty($programIds)) {
            return false;
        }

        if ((int) $bedRoom->facility_id !== $pair['facility_id'] || ! in_array((int) $bedRoom->program_id, $programIds, true)) {
            return false;
        }

        $roomId = $this->input('room_id');
        if (! $roomId) {
            return true;
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
            'bed_number' => ['sometimes', 'string', 'min:1'],
            'bed_type' => ['sometimes', 'in:single,ada_single,double_top,double_bottom'],
            'room_id' => ['sometimes', 'integer', 'exists:rooms,id'],
            'status' => ['sometimes', 'in:available,occupied,cleaning,maintenance'],
        ];
    }
}
