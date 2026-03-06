<?php

namespace App\Support;

use App\Models\Bed;
use App\Models\Document;
use App\Models\Facility;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class Tenant
{
    /** @var array<int, array<int>> */
    private static array $programIdsCache = [];

    public static function isAdmin(?User $user): bool
    {
        return (bool) ($user?->is_admin ?? false);
    }

    /**
     * @return array{facility_id:int, program_id:int|null}|null
     */
    public static function pair(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        $facilityId = $user->facility_id;
        $programId = $user->program_id;

        if (! $facilityId) {
            return null;
        }

        return [
            'facility_id' => (int) $facilityId,
            'program_id' => $programId ? (int) $programId : null,
        ];
    }

    /**
     * @return int[]
     */
    public static function programIds(?User $user): array
    {
        if (! $user || self::isAdmin($user)) {
            return [];
        }

        $userId = (int) $user->id;
        if (isset(self::$programIdsCache[$userId])) {
            return self::$programIdsCache[$userId];
        }

        if ($user->relationLoaded('programs')) {
            $ids = $user->programs->pluck('id')->all();
        } else {
            $ids = $user->programs()->pluck('programs.id')->all();
        }

        if (! empty($user->program_id)) {
            $ids[] = (int) $user->program_id;
        }

        $ids = array_values(array_unique(array_map('intval', $ids)));
        self::$programIdsCache[$userId] = $ids;

        return $ids;
    }

    public static function abortIfCannotAccessFacility(?User $user, Facility $facility): void
    {
        if (self::isAdmin($user)) {
            return;
        }

        abort_unless((int) $facility->id === (int) ($user?->facility_id ?? 0), 403);
    }

    public static function abortIfCannotAccessRoom(?User $user, Room $room): void
    {
        if (self::isAdmin($user)) {
            return;
        }

        $programIds = self::programIds($user);
        abort_unless((int) $room->facility_id === (int) ($user?->facility_id ?? 0), 403);
        abort_unless(in_array((int) $room->program_id, $programIds, true), 403);
    }

    public static function abortIfCannotAccessBed(?User $user, Bed $bed): void
    {
        if (self::isAdmin($user)) {
            return;
        }

        $room = $bed->room()->select(['id', 'facility_id', 'program_id'])->first();
        abort_unless($room, 403);
        $programIds = self::programIds($user);
        abort_unless((int) $room->facility_id === (int) ($user?->facility_id ?? 0), 403);
        abort_unless(in_array((int) $room->program_id, $programIds, true), 403);
    }

    public static function abortIfCannotAccessPatient(?User $user, Patient $patient): void
    {
        if (self::isAdmin($user)) {
            return;
        }

        $programIds = self::programIds($user);
        abort_unless((int) $patient->facility_id === (int) ($user?->facility_id ?? 0), 403);
        if (! empty($patient->program_id)) {
            abort_unless(in_array((int) $patient->program_id, $programIds, true), 403);
        }
    }

    public static function abortIfCannotAccessDocument(?User $user, Document $document): void
    {
        if (self::isAdmin($user)) {
            return;
        }

        $programIds = self::programIds($user);
        abort_unless((int) $document->facility_id === (int) ($user?->facility_id ?? 0), 403);
        if (! empty($document->program_id)) {
            abort_unless(in_array((int) $document->program_id, $programIds, true), 403);
        }
    }

    public static function abortIfCannotAccessNotification(?User $user, Notification $notification): void
    {
        if (self::isAdmin($user)) {
            return;
        }

        $programIds = self::programIds($user);
        abort_unless((int) $notification->facility_id === (int) ($user?->facility_id ?? 0), 403);
        if (! empty($notification->program_id)) {
            abort_unless(in_array((int) $notification->program_id, $programIds, true), 403);
        }
    }

    public static function emptyIfUnassigned(Builder $query, ?User $user): Builder
    {
        if (! $user) {
            return $query->whereRaw('1=0');
        }

        if (self::isAdmin($user)) {
            return $query;
        }

        if (! self::pair($user)) {
            return $query->whereRaw('1=0');
        }

        return $query;
    }
}
