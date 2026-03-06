<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Support\Tenant;

class Bed extends Model
{
    use HasFactory;

    protected $fillable = [
        'bed_number',
        'bed_type',
        'room_id',
        'status',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class, 'bed_id');
    }

    public function scopeVisibleTo(Builder $query, ?User $user): Builder
    {
        if (! $user) {
            return $query->whereRaw('1=0');
        }

        if ($user->is_admin) {
            return $query;
        }

        if (! $user->facility_id) {
            return $query->whereRaw('1=0');
        }

        $programIds = Tenant::programIds($user);
        if (empty($programIds)) {
            return $query->whereRaw('1=0');
        }

        return $query->whereHas('room', function (Builder $rooms) use ($user) {
            $programIds = Tenant::programIds($user);
            $rooms->where('facility_id', $user->facility_id)->whereIn('program_id', $programIds);
        });
    }
}
