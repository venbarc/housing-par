<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'patient_id',
        'file_name',
        'file_type',
        'file_size',
        'storage_path',
        'file_url',
        'uploaded_at',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'uploaded_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
