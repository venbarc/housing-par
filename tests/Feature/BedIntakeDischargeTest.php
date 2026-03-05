<?php

namespace Tests\Feature;

use App\Models\Bed;
use App\Models\Facility;
use App\Models\Patient;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BedIntakeDischargeTest extends TestCase
{
    use RefreshDatabase;

    public function test_intake_to_bed_referral_succeeds(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $facility = Facility::create(['name' => 'Test Facility', 'notes' => null]);
        $room = Room::create(['name' => '101', 'notes' => null, 'facility_id' => $facility->id]);
        $bed = Bed::create([
            'bed_number' => 'A',
            'bed_type' => 'single',
            'room_id' => $room->id,
            'status' => 'available',
        ]);

        $response = $this->post('/patients', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1990-01-02',
            'status' => 'referral',
            'referral_from' => 'HOSN',
            'insurance' => 'Medicaid',
            'intake_date' => '2026-03-04',
            'discharge_date' => null,
            'bed_id' => $bed->id,
            'psych_services_access' => 'wc_health',
            'therapy_services_access' => 'wc_health',
            'pcp_services_access' => 'other_agency',
            'medications_access' => 'no',
            'er_visits_past_year' => '1_3',
            'inpatient_stays_past_year' => '0',
            'dependable_transportation' => true,
            'stable_housing' => false,
            'homelessness_days_past_year' => '10_plus',
            'vital_documents_access' => true,
            'phone_access' => true,
            'employed_or_income' => false,
            'support_system' => true,
            'is_veteran' => false,
            'veteran_connected_services' => 'na',
            'seeking_mat_services' => false,
            'enrolled_mat_services' => false,
            'arrests_past_12_months' => '0',
            'arrests_lifetime' => '1_2',
            'jail_days_past_12_months' => '0',
            'jail_days_lifetime' => '1_7',
            'prison_time_past_12_months' => '0',
            'prison_time_lifetime' => '0',
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('patients', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'status' => 'referral',
            'bed_id' => $bed->id,
        ]);

        $this->assertDatabaseHas('beds', [
            'id' => $bed->id,
            'status' => 'occupied',
        ]);
    }

    public function test_intake_referral_missing_referral_from_fails(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post('/patients', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'dob' => '1990-01-02',
            'status' => 'referral',
            'referral_from' => null,
            'insurance' => null,
            'intake_date' => '2026-03-04',
            'psych_services_access' => 'wc_health',
            'therapy_services_access' => 'wc_health',
            'pcp_services_access' => 'wc_health',
            'medications_access' => 'wc_health',
            'er_visits_past_year' => '0',
            'inpatient_stays_past_year' => '0',
            'dependable_transportation' => true,
            'stable_housing' => true,
            'homelessness_days_past_year' => '0',
        ]);

        $response->assertSessionHasErrors(['referral_from']);
    }

    public function test_intake_to_occupied_bed_fails(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $facility = Facility::create(['name' => 'Test Facility', 'notes' => null]);
        $room = Room::create(['name' => '101', 'notes' => null, 'facility_id' => $facility->id]);
        $bed = Bed::create([
            'bed_number' => 'A',
            'bed_type' => 'single',
            'room_id' => $room->id,
            'status' => 'occupied',
        ]);

        Patient::create([
            'first_name' => 'Existing',
            'last_name' => 'Person',
            'dob' => '1980-01-01',
            'status' => 'walk_in',
            'referral_from' => null,
            'insurance' => null,
            'intake_date' => '2026-03-01',
            'discharge_date' => null,
            'psych_services_access' => 'no',
            'therapy_services_access' => 'no',
            'pcp_services_access' => 'no',
            'medications_access' => 'no',
            'er_visits_past_year' => '0',
            'inpatient_stays_past_year' => '0',
            'dependable_transportation' => false,
            'stable_housing' => false,
            'homelessness_days_past_year' => '10_plus',
            'bed_id' => $bed->id,
        ]);

        $response = $this->post('/patients', [
            'first_name' => 'New',
            'last_name' => 'Person',
            'dob' => '1999-01-01',
            'status' => 'walk_in',
            'referral_from' => null,
            'insurance' => null,
            'intake_date' => '2026-03-04',
            'bed_id' => $bed->id,
            'psych_services_access' => 'no',
            'therapy_services_access' => 'no',
            'pcp_services_access' => 'no',
            'medications_access' => 'no',
            'er_visits_past_year' => '0',
            'inpatient_stays_past_year' => '0',
            'dependable_transportation' => false,
            'stable_housing' => false,
            'homelessness_days_past_year' => '10_plus',
            'vital_documents_access' => false,
            'phone_access' => true,
            'employed_or_income' => false,
            'support_system' => false,
            'is_veteran' => false,
            'veteran_connected_services' => 'na',
            'seeking_mat_services' => false,
            'enrolled_mat_services' => false,
            'arrests_past_12_months' => '0',
            'arrests_lifetime' => '0',
            'jail_days_past_12_months' => '0',
            'jail_days_lifetime' => '0',
            'prison_time_past_12_months' => '0',
            'prison_time_lifetime' => '0',
        ]);

        $response->assertSessionHasErrors(['bed_id']);
    }

    public function test_discharge_keeps_record_and_sets_discharged_at(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $facility = Facility::create(['name' => 'Test Facility', 'notes' => null]);
        $room = Room::create(['name' => '101', 'notes' => null, 'facility_id' => $facility->id]);
        $bed = Bed::create([
            'bed_number' => 'A',
            'bed_type' => 'single',
            'room_id' => $room->id,
            'status' => 'occupied',
        ]);

        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1990-01-02',
            'status' => 'referral',
            'referral_from' => 'HOSN',
            'insurance' => null,
            'intake_date' => '2026-03-04',
            'discharge_date' => null,
            'psych_services_access' => 'wc_health',
            'therapy_services_access' => 'wc_health',
            'pcp_services_access' => 'other_agency',
            'medications_access' => 'no',
            'er_visits_past_year' => '1_3',
            'inpatient_stays_past_year' => '0',
            'dependable_transportation' => true,
            'stable_housing' => false,
            'homelessness_days_past_year' => '10_plus',
            'bed_id' => $bed->id,
        ]);

        $response = $this->post("/beds/{$bed->id}/discharge", [
            'patient_id' => $patient->id,
        ]);

        $response->assertSessionHasNoErrors();

        $patient->refresh();
        $bed->refresh();

        $this->assertNull($patient->bed_id);
        $this->assertSame($bed->id, $patient->discharged_bed_id);
        $this->assertNotNull($patient->discharged_at);
        $this->assertNull($patient->discharge_date);
        $this->assertSame('available', $bed->status);
    }
}
