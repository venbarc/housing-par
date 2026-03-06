<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuditLogger
{
    private const IGNORE_KEYS = [
        'password',
        'remember_token',
        'created_at',
        'updated_at',
    ];

    /**
     * @param array<string, mixed>|null $oldValues
     * @param array<string, mixed>|null $newValues
     */
    public static function log(string $action, ?Model $auditable = null, ?array $oldValues = null, ?array $newValues = null, ?int $facilityId = null, ?int $programId = null): void
    {
        $request = request();
        $user = Auth::user();

        AuditLog::create([
            'user_id' => $user?->id,
            'facility_id' => $facilityId,
            'program_id' => $programId,
            'action' => $action,
            'auditable_type' => $auditable ? $auditable::class : null,
            'auditable_id' => $auditable?->getKey(),
            'old_values' => $oldValues ? self::filterValues($oldValues) : null,
            'new_values' => $newValues ? self::filterValues($newValues) : null,
            'url' => $request?->fullUrl(),
            'method' => $request?->method(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }

    public static function logModelEvent(string $action, Model $model): void
    {
        [$facilityId, $programId] = self::resolveTenantIds($model);

        if ($action === 'created') {
            self::log('created', $model, null, $model->getAttributes(), $facilityId, $programId);
            return;
        }

        if ($action === 'deleted') {
            self::log('deleted', $model, $model->getAttributes(), null, $facilityId, $programId);
            return;
        }

        if ($action === 'updated') {
            $changes = $model->getChanges();
            $changedKeys = array_keys($changes);
            $original = Arr::only($model->getOriginal(), $changedKeys);

            if (empty($changes)) {
                return;
            }

            self::log('updated', $model, $original, $changes, $facilityId, $programId);
            return;
        }
    }

    /**
     * @return array{0:int|null,1:int|null}
     */
    private static function resolveTenantIds(Model $model): array
    {
        $attributes = $model->getAttributes();

        $facilityId = array_key_exists('facility_id', $attributes) ? (int) ($attributes['facility_id'] ?? 0) : null;
        $programId = array_key_exists('program_id', $attributes) ? (int) ($attributes['program_id'] ?? 0) : null;

        if ($facilityId && $programId) {
            return [$facilityId, $programId];
        }

        // Facility: treat as location-only record.
        if ($model instanceof \App\Models\Facility) {
            return [(int) $model->getKey(), null];
        }

        // Program: treat as program-only record.
        if ($model instanceof \App\Models\Program) {
            return [null, (int) $model->getKey()];
        }

        // Bed: derive from room.
        if ($model instanceof \App\Models\Bed) {
            $roomId = $model->room_id;
            if (! $roomId) {
                return [null, null];
            }
            $row = DB::table('rooms')->where('id', $roomId)->select(['facility_id', 'program_id'])->first();
            return [$row?->facility_id ? (int) $row->facility_id : null, $row?->program_id ? (int) $row->program_id : null];
        }

        // Document: derive via patient/bed if not set.
        if ($model instanceof \App\Models\Document) {
            if ($model->patient_id) {
                $row = DB::table('patients')->where('id', $model->patient_id)->select(['facility_id', 'program_id'])->first();
                return [$row?->facility_id ? (int) $row->facility_id : null, $row?->program_id ? (int) $row->program_id : null];
            }
            if ($model->bed_id) {
                $row = DB::table('beds')
                    ->join('rooms', 'rooms.id', '=', 'beds.room_id')
                    ->where('beds.id', $model->bed_id)
                    ->select(['rooms.facility_id', 'rooms.program_id'])
                    ->first();
                return [$row?->facility_id ? (int) $row->facility_id : null, $row?->program_id ? (int) $row->program_id : null];
            }
        }

        // Room: has facility/program after migration.
        if ($model instanceof \App\Models\Room) {
            return [(int) ($model->facility_id ?? 0) ?: null, (int) ($model->program_id ?? 0) ?: null];
        }

        // Transfer: prefer destination tenancy, fallback to source tenancy.
        if ($model instanceof \App\Models\PatientTransfer) {
            $destinationFacilityId = (int) ($model->destination_facility_id ?? 0);
            $destinationProgramId = (int) ($model->destination_program_id ?? 0);
            if ($destinationFacilityId && $destinationProgramId) {
                return [$destinationFacilityId, $destinationProgramId];
            }

            return [
                (int) ($model->source_facility_id ?? 0) ?: null,
                (int) ($model->source_program_id ?? 0) ?: null,
            ];
        }

        return [$facilityId ?: null, $programId ?: null];
    }

    /**
     * @param array<string, mixed> $values
     * @return array<string, mixed>
     */
    private static function filterValues(array $values): array
    {
        $filtered = Arr::except($values, self::IGNORE_KEYS);

        // Avoid logging empty strings for optional fields; keep meaningfully changed values.
        return array_filter($filtered, static fn ($v) => $v !== '');
    }
}

