<?php

namespace Tests\Feature;

use App\Models\Bed;
use App\Models\Facility;
use App\Models\Patient;
use App\Models\PatientTransfer;
use App\Models\Program;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationOnlyTenantAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_can_see_all_program_records_within_location(): void
    {
        [$facilityA, $programA1, $roomA1, $bedA1] = $this->createBedContext('Location A', 'Program A1', '101', 'A');
        [, $programA2, $roomA2, $bedA2] = $this->createBedContext('Location A', 'Program A2', '102', 'B', facility: $facilityA);
        [$facilityB, $programB1, $roomB1, $bedB1] = $this->createBedContext('Location B', 'Program B1', '201', 'C');

        $user = $this->createUser($facilityA->id, $programA1->id, [$programA1->id]);

        $patientA1 = $this->createPatient($facilityA->id, $programA1->id, $bedA1->id);
        $patientA2 = $this->createPatient($facilityA->id, $programA2->id, $bedA2->id, ['first_name' => 'Alex']);
        $patientB1 = $this->createPatient($facilityB->id, $programB1->id, $bedB1->id, ['first_name' => 'Blair']);

        $visibleBedIds = Bed::query()->visibleTo($user)->pluck('id')->all();
        $visiblePatientIds = Patient::query()->visibleTo($user)->pluck('id')->all();

        $this->assertContains($bedA1->id, $visibleBedIds);
        $this->assertContains($bedA2->id, $visibleBedIds);
        $this->assertNotContains($bedB1->id, $visibleBedIds);

        $this->assertContains($patientA1->id, $visiblePatientIds);
        $this->assertContains($patientA2->id, $visiblePatientIds);
        $this->assertNotContains($patientB1->id, $visiblePatientIds);

        // Silence unused vars from context creation in strict tooling.
        $this->assertNotNull($roomA1);
        $this->assertNotNull($roomA2);
        $this->assertNotNull($roomB1);
    }

    public function test_non_admin_can_update_patient_in_same_location_even_if_program_not_assigned_to_user(): void
    {
        [$facilityA, $programA1, $roomA1] = $this->createBedContext('Location A', 'Program A1', '101', 'A');
        [, $programA2, $roomA2] = $this->createBedContext('Location A', 'Program A2', '102', 'B', facility: $facilityA);

        $user = $this->createUser($facilityA->id, $programA1->id, [$programA1->id]);
        $patient = $this->createPatient($facilityA->id, $programA2->id, null);

        $this->actingAs($user);
        $response = $this->patch("/patients/{$patient->id}", [
            'insurance' => 'Updated Insurance',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'insurance' => 'Updated Insurance',
        ]);

        $this->assertNotNull($roomA1);
        $this->assertNotNull($roomA2);
    }

    public function test_non_admin_cannot_update_patient_in_other_location(): void
    {
        [$facilityA, $programA1] = $this->createBedContext('Location A', 'Program A1', '101', 'A');
        [$facilityB, $programB1] = $this->createBedContext('Location B', 'Program B1', '201', 'B');

        $user = $this->createUser($facilityA->id, $programA1->id, [$programA1->id]);
        $patient = $this->createPatient($facilityB->id, $programB1->id, null);

        $this->actingAs($user);
        $response = $this->patch("/patients/{$patient->id}", [
            'insurance' => 'Denied Update',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('patients', [
            'id' => $patient->id,
            'insurance' => 'Denied Update',
        ]);
    }

    public function test_non_admin_with_location_and_no_program_assignments_can_access_allocated_routes(): void
    {
        [$facilityA] = $this->createBedContext('Location A', 'Program A1', '101', 'A');
        $user = $this->createUser($facilityA->id, null, []);

        $this->actingAs($user);
        $response = $this->get('/patients');

        $response->assertStatus(200);
        $response->assertDontSee('Waiting for admin allocation');
    }

    public function test_transfer_visibility_and_reject_is_destination_location_only(): void
    {
        [$sourceFacility, $sourceProgram] = $this->createBedContext('Source Location', 'Source Program', '101', 'A');
        [$destinationFacility, $destinationProgram, $destinationRoom, $destinationBed] = $this->createBedContext('Destination Location', 'Destination Program', '201', 'B');

        $sourcePatient = $this->createPatient($sourceFacility->id, $sourceProgram->id, null);

        $transfer = PatientTransfer::create([
            'source_patient_id' => $sourcePatient->id,
            'source_bed_id' => null,
            'source_facility_id' => $sourceFacility->id,
            'source_program_id' => $sourceProgram->id,
            'destination_facility_id' => $destinationFacility->id,
            'destination_program_id' => $destinationProgram->id,
            'status' => 'pending',
            'requested_by_user_id' => null,
            'requested_at' => now(),
        ]);

        $destinationUser = $this->createUser($destinationFacility->id, null, []);
        $sourceUser = $this->createUser($sourceFacility->id, null, []);

        $this->assertTrue(PatientTransfer::query()->visibleTo($destinationUser)->whereKey($transfer->id)->exists());
        $this->assertFalse(PatientTransfer::query()->visibleTo($sourceUser)->whereKey($transfer->id)->exists());

        $this->actingAs($destinationUser);
        $response = $this->post("/transfers/{$transfer->id}/reject");
        $response->assertSessionHasNoErrors();

        $transfer->refresh();
        $this->assertSame('rejected', $transfer->status);

        // keep variables explicitly used
        $this->assertNotNull($destinationRoom);
        $this->assertNotNull($destinationBed);
    }

    /**
     * @return array{0: Facility, 1: Program, 2: Room, 3: Bed}
     */
    private function createBedContext(
        string $facilityName,
        string $programName,
        string $roomName,
        string $bedNumber,
        string $bedStatus = 'available',
        ?Facility $facility = null
    ): array {
        $facility = $facility ?? Facility::create(['name' => $facilityName, 'notes' => null]);
        $program = Program::create(['name' => $programName, 'notes' => null]);
        $room = Room::create([
            'name' => $roomName,
            'notes' => null,
            'facility_id' => $facility->id,
            'program_id' => $program->id,
        ]);
        $bed = Bed::create([
            'bed_number' => $bedNumber,
            'bed_type' => 'single',
            'room_id' => $room->id,
            'status' => $bedStatus,
        ]);

        return [$facility, $program, $room, $bed];
    }

    /**
     * @param int[] $programIds
     */
    private function createUser(?int $facilityId = null, ?int $primaryProgramId = null, array $programIds = []): User
    {
        $user = User::factory()->create([
            'is_admin' => false,
            'can_login' => true,
            'facility_id' => $facilityId,
            'program_id' => $primaryProgramId,
        ]);

        if (! empty($programIds)) {
            $user->programs()->sync($programIds);
        }

        return $user;
    }

    /**
     * @param array<string,mixed> $overrides
     */
    private function createPatient(int $facilityId, int $programId, ?int $bedId, array $overrides = []): Patient
    {
        return Patient::create(array_merge([
            'facility_id' => $facilityId,
            'program_id' => $programId,
            'first_name' => 'Jordan',
            'last_name' => 'Smith',
            'dob' => '1990-01-01',
            'status' => 'referral',
            'referral_from' => 'HOSN',
            'insurance' => null,
            'intake_date' => '2026-03-01',
            'discharge_date' => null,
            'bed_id' => $bedId,
            'psych_services_access' => 'no',
            'therapy_services_access' => 'no',
            'pcp_services_access' => 'no',
            'medications_access' => 'no',
            'er_visits_past_year' => '0',
            'inpatient_stays_past_year' => '0',
            'dependable_transportation' => false,
            'stable_housing' => false,
            'homelessness_days_past_year' => '0',
            'vital_documents_access' => false,
            'phone_access' => false,
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
        ], $overrides));
    }
}
