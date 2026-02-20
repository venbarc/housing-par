<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bed extends Model
{
    use HasFactory;

    protected $fillable = [
        'bed_number',
        'ward_id',
        'room',
        'status',
        'pos_x',
        'pos_y',
        'patient_id',
    ];

    protected $casts = [
        'pos_x' => 'float',
        'pos_y' => 'float',
    ];

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
