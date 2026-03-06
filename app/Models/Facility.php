<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'notes'];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
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

        return $query->where('id', $user->facility_id);
    }
}
