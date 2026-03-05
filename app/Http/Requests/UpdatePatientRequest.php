<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'string', 'min:1'],
            'last_name' => ['sometimes', 'string', 'min:1'],
            'dob' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:referral,walk_in'],
            'referral_from' => ['sometimes', 'required_if:status,referral', 'nullable', 'string'],
            'insurance' => ['sometimes', 'nullable', 'string'],
            'intake_date' => ['sometimes', 'date'],
            'discharge_date' => ['sometimes', 'nullable', 'date'],
            'discharged_at' => ['sometimes', 'nullable', 'date'],
            'bed_id' => ['sometimes', 'nullable', 'integer', 'exists:beds,id'],

            // Admission questionnaire
            'psych_services_access' => ['sometimes', 'in:wc_health,other_agency,no'],
            'therapy_services_access' => ['sometimes', 'in:wc_health,other_agency,no'],
            'pcp_services_access' => ['sometimes', 'in:wc_health,other_agency,no'],
            'medications_access' => ['sometimes', 'in:wc_health,other_agency,no'],
            'er_visits_past_year' => ['sometimes', 'in:0,1_3,4_10,10_plus'],
            'inpatient_stays_past_year' => ['sometimes', 'in:0,1_3,4_10,10_plus'],
            'dependable_transportation' => ['sometimes', 'boolean'],
            'stable_housing' => ['sometimes', 'boolean'],
            'homelessness_days_past_year' => ['sometimes', 'in:0,1_3,4_10,10_plus'],
            'vital_documents_access' => ['sometimes', 'boolean'],
            'phone_access' => ['sometimes', 'boolean'],
            'employed_or_income' => ['sometimes', 'boolean'],
            'support_system' => ['sometimes', 'boolean'],
            'is_veteran' => ['sometimes', 'boolean'],
            'veteran_connected_services' => ['sometimes', 'in:yes,no,na'],
            'seeking_mat_services' => ['sometimes', 'boolean'],
            'enrolled_mat_services' => ['sometimes', 'boolean'],
            'arrests_past_12_months' => ['sometimes', 'in:0,1_2,3_4,5_plus'],
            'arrests_lifetime' => ['sometimes', 'in:0,1_2,3_4,5_plus'],
            'jail_days_past_12_months' => ['sometimes', 'in:0,1_7,8_14,14_plus'],
            'jail_days_lifetime' => ['sometimes', 'in:0,1_7,8_14,14_plus'],
            'prison_time_past_12_months' => ['sometimes', 'in:0,1_7,8_14,14_plus'],
            'prison_time_lifetime' => ['sometimes', 'in:0,1_7,8_14,14_plus'],
        ];
    }
}
