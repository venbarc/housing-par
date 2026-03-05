<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'dob',
        'status',
        'referral_from',
        'insurance',
        'intake_date',
        'discharge_date',
        'discharged_at',
        'bed_id',
        'discharged_bed_id',
        'psych_services_access',
        'therapy_services_access',
        'pcp_services_access',
        'medications_access',
        'er_visits_past_year',
        'inpatient_stays_past_year',
        'dependable_transportation',
        'stable_housing',
        'homelessness_days_past_year',
        'vital_documents_access',
        'phone_access',
        'employed_or_income',
        'support_system',
        'is_veteran',
        'veteran_connected_services',
        'seeking_mat_services',
        'enrolled_mat_services',
        'arrests_past_12_months',
        'arrests_lifetime',
        'jail_days_past_12_months',
        'jail_days_lifetime',
        'prison_time_past_12_months',
        'prison_time_lifetime',
    ];

    protected $casts = [
        'dob' => 'date:Y-m-d',
        'intake_date' => 'date:Y-m-d',
        'discharge_date' => 'date:Y-m-d',
        'discharged_at' => 'datetime',
        'dependable_transportation' => 'boolean',
        'stable_housing' => 'boolean',
        'vital_documents_access' => 'boolean',
        'phone_access' => 'boolean',
        'employed_or_income' => 'boolean',
        'support_system' => 'boolean',
        'is_veteran' => 'boolean',
        'seeking_mat_services' => 'boolean',
        'enrolled_mat_services' => 'boolean',
    ];

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    public function dischargedBed(): BelongsTo
    {
        return $this->belongsTo(Bed::class, 'discharged_bed_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}
