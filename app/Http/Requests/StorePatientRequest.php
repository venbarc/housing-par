<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:1'],
            'last_name' => ['required', 'string', 'min:1'],
            'dob' => ['required', 'date'],
            'status' => ['required', 'in:referral,walk_in'],
            'referral_from' => ['required_if:status,referral', 'nullable', 'string'],
            'insurance' => ['sometimes', 'nullable', 'string'],
            'intake_date' => ['required', 'date'],
            'discharge_date' => ['sometimes', 'nullable', 'date'],
            'bed_id' => ['sometimes', 'nullable', 'integer', 'exists:beds,id'],

            // Admission questionnaire
            'psych_services_access' => ['required_with:bed_id', 'in:wc_health,other_agency,no'],
            'therapy_services_access' => ['required_with:bed_id', 'in:wc_health,other_agency,no'],
            'pcp_services_access' => ['required_with:bed_id', 'in:wc_health,other_agency,no'],
            'medications_access' => ['required_with:bed_id', 'in:wc_health,other_agency,no'],
            'er_visits_past_year' => ['required_with:bed_id', 'in:0,1_3,4_10,10_plus'],
            'inpatient_stays_past_year' => ['required_with:bed_id', 'in:0,1_3,4_10,10_plus'],
            'dependable_transportation' => ['required_with:bed_id', 'boolean'],
            'stable_housing' => ['required_with:bed_id', 'boolean'],
            'homelessness_days_past_year' => ['required_with:bed_id', 'in:0,1_3,4_10,10_plus'],
            'vital_documents_access' => ['required_with:bed_id', 'boolean'],
            'phone_access' => ['required_with:bed_id', 'boolean'],
            'employed_or_income' => ['required_with:bed_id', 'boolean'],
            'support_system' => ['required_with:bed_id', 'boolean'],
            'is_veteran' => ['required_with:bed_id', 'boolean'],
            'veteran_connected_services' => ['required_with:bed_id', 'in:yes,no,na'],
            'seeking_mat_services' => ['required_with:bed_id', 'boolean'],
            'enrolled_mat_services' => ['required_with:bed_id', 'boolean'],
            'arrests_past_12_months' => ['required_with:bed_id', 'in:0,1_2,3_4,5_plus'],
            'arrests_lifetime' => ['required_with:bed_id', 'in:0,1_2,3_4,5_plus'],
            'jail_days_past_12_months' => ['required_with:bed_id', 'in:0,1_7,8_14,14_plus'],
            'jail_days_lifetime' => ['required_with:bed_id', 'in:0,1_7,8_14,14_plus'],
            'prison_time_past_12_months' => ['required_with:bed_id', 'in:0,1_7,8_14,14_plus'],
            'prison_time_lifetime' => ['required_with:bed_id', 'in:0,1_7,8_14,14_plus'],
        ];
    }
}
