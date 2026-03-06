<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Support\Tenant;

class Room extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'notes', 'facility_id', 'program_id'];

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
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

        return $query
            ->where('facility_id', $user->facility_id)
            ->whereIn('program_id', $programIds);
    }
}
