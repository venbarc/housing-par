<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
}
