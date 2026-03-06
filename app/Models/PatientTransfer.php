<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_patient_id',
        'source_bed_id',
        'source_facility_id',
        'source_program_id',
        'destination_facility_id',
        'destination_program_id',
        'status',
        'requested_by_user_id',
        'reviewed_by_user_id',
        'requested_at',
        'reviewed_at',
        'accepted_at',
        'rejected_at',
        'accepted_patient_id',
        'acceptance_intake_date',
        'acceptance_bed_id',
    ];

    protected $casts = [
        'source_patient_id' => 'integer',
        'source_bed_id' => 'integer',
        'source_facility_id' => 'integer',
        'source_program_id' => 'integer',
        'destination_facility_id' => 'integer',
        'destination_program_id' => 'integer',
        'requested_by_user_id' => 'integer',
        'reviewed_by_user_id' => 'integer',
        'accepted_patient_id' => 'integer',
        'acceptance_bed_id' => 'integer',
        'requested_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'acceptance_intake_date' => 'date:Y-m-d',
    ];

    public function sourcePatient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'source_patient_id');
    }

    public function sourceBed(): BelongsTo
    {
        return $this->belongsTo(Bed::class, 'source_bed_id');
    }

    public function sourceFacility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'source_facility_id');
    }

    public function sourceProgram(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'source_program_id');
    }

    public function destinationFacility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'destination_facility_id');
    }

    public function destinationProgram(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'destination_program_id');
    }

    public function acceptedPatient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'accepted_patient_id');
    }

    public function acceptanceBed(): BelongsTo
    {
        return $this->belongsTo(Bed::class, 'acceptance_bed_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
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

        return $query->where('destination_facility_id', $user->facility_id);
    }
}
