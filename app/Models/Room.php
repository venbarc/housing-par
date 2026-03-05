<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'notes', 'facility_id'];

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }
}
