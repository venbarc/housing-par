<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'age',
        'gender',
        'diagnosis',
        'status',
        'doctor',
        'admission_date',
        'contact',
        'notes',
        'bed_id',
    ];

    protected $casts = [
        'age' => 'integer',
        'admission_date' => 'date:Y-m-d',
    ];

    public function bed(): HasOne
    {
        return $this->hasOne(Bed::class, 'patient_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}
