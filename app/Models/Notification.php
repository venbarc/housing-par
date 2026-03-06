<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Notification extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'type',
        'message',
        'is_read',
        'facility_id',
        'program_id',
        'created_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];

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

        return $query->where('facility_id', $user->facility_id);
    }
}
