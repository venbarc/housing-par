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

class BedIntakeDischargeTest extends TestCase
{
    use RefreshDatabase;

    public function test_intake_to_bed_referral_succeeds(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        [$facility, $program, $room, $bed] = $this->createBedContext('Source Facility', 'Source Program', '101', 'A');

        $response = $this->post('/patients', $this->intakePayload($bed->id, [
            'intake_date' => '2026-03-04',
            'facility_id' => $facility->id,
            'program_id' => $program->id,
        ]));

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('patients', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'status' => 'referral',
            'bed_id' => $bed->id,
            'facility_id' => $facility->id,
            'program_id' => $program->id,
        ]);

        $this->assertDatabaseHas('beds', [
            'id' => $bed->id,
            'status' => 'occupied',
        ]);
    }

    public function test_discharge_requires_disposition_destination_and_leave_details(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        [, , , $bed] = $this->createBedContext('Source Facility', 'Source Program', '101', 'A', 'occupied');
        $patient = $this->createPatientOnBed($bed);

        $response = $this->post("/beds/{$bed->id}/discharge", [
            'patient_id' => $patient->id,
        ]);

        $response->assertSessionHasErrors([
            'discharge_disposition',
            'discharge_destination',
            'leave_details',
        ]);
    }

    public function test_non_move_discharge_keeps_record_sets_metadata_and_frees_bed(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        [, , , $bed] = $this->createBedContext('Source Facility', 'Source Program', '101', 'A', 'occupied');
        $patient = $this->createPatientOnBed($bed);

        $response = $this->post("/beds/{$bed->id}/discharge", [
            'patient_id' => $patient->id,
            'discharge_disposition' => 'OTHER',
            'discharge_destination' => 'Safe Haven',
            'leave_details' => 'Client exited shelter and left personal plan notes.',
            'is_move' => false,
        ]);

        $response->assertSessionHasNoErrors();

        $patient->refresh();
        $bed->refresh();

        $this->assertNull($patient->bed_id);
        $this->assertSame($bed->id, $patient->discharged_bed_id);
        $this->assertNotNull($patient->discharged_at);
        $this->assertSame('OTHER', $patient->discharge_disposition);
        $this->assertSame('Safe Haven', $patient->discharge_destination);
        $this->assertSame('Client exited shelter and left personal plan notes.', $patient->leave_details);
        $this->assertNull($patient->move_to_facility_id);
        $this->assertNull($patient->move_to_program_id);
        $this->assertSame('available', $bed->status);
        $this->assertDatabaseCount('patient_transfers', 0);
    }

    public function test_move_discharge_creates_pending_transfer_with_destination_pair(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        [$sourceFacility, $sourceProgram, , $sourceBed] = $this->createBedContext('Source Facility', 'Source Program', '101', 'A', 'occupied');
        [$destinationFacility, $destinationProgram] = $this->createBedContext('Destination Facility', 'Destination Program', '201', 'B');

        $patient = $this->createPatientOnBed($sourceBed, [
            'facility_id' => $sourceFacility->id,
            'program_id' => $sourceProgram->id,
        ]);

        $response = $this->post("/beds/{$sourceBed->id}/discharge", [
            'patient_id' => $patient->id,
            'discharge_disposition' => 'Administrative Discharge',
            'discharge_destination' => 'Staying or living with family, permanent tenure',
            'leave_details' => 'Transferred to destination per move workflow.',
            'is_move' => true,
            'destination_facility_id' => $destinationFacility->id,
            'destination_program_id' => $destinationProgram->id,
        ]);

        $response->assertSessionHasNoErrors();

        $patient->refresh();

        $this->assertSame($destinationFacility->id, $patient->move_to_facility_id);
        $this->assertSame($destinationProgram->id, $patient->move_to_program_id);
        $this->assertDatabaseHas('patient_transfers', [
            'source_patient_id' => $patient->id,
            'source_bed_id' => $sourceBed->id,
            'source_facility_id' => $sourceFacility->id,
            'source_program_id' => $sourceProgram->id,
            'destination_facility_id' => $destinationFacility->id,
            'destination_program_id' => $destinationProgram->id,
            'status' => 'pending',
        ]);
    }

    public function test_destination_staff_accepts_transfer_and_creates_new_intake(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        [$sourceFacility, $sourceProgram, , $sourceBed] = $this->createBedContext('Source Facility', 'Source Program', '101', 'A', 'occupied');
        [$destinationFacility, $destinationProgram, , $destinationBed] = $this->createBedContext('Destination Facility', 'Destination Program', '201', 'B', 'available');

        $sourcePatient = $this->createPatientOnBed($sourceBed, [
            'facility_id' => $sourceFacility->id,
            'program_id' => $sourceProgram->id,
        ]);

        $this->post("/beds/{$sourceBed->id}/discharge", [
            'patient_id' => $sourcePatient->id,
            'discharge_disposition' => 'Administrative Discharge',
            'discharge_destination' => 'Staying or living with friends, permanent tenure',
            'leave_details' => 'Move approved for destination intake.',
            'is_move' => true,
            'destination_facility_id' => $destinationFacility->id,
            'destination_program_id' => $destinationProgram->id,
        ])->assertSessionHasNoErrors();

        $transfer = PatientTransfer::query()->where('source_patient_id', $sourcePatient->id)->firstOrFail();
        $destinationUser = $this->createUser($destinationFacility->id, $destinationProgram->id);

        $this->actingAs($destinationUser);

        $response = $this->post("/transfers/{$transfer->id}/accept", [
            'intake_date' => '2026-03-10',
            'bed_id' => $destinationBed->id,
        ]);

        $response->assertSessionHasNoErrors();

        $transfer->refresh();
        $destinationBed->refresh();
        $sourcePatient->refresh();

        $this->assertSame('accepted', $transfer->status);
        $this->assertNotNull($transfer->accepted_patient_id);
        $this->assertSame($destinationBed->id, $transfer->acceptance_bed_id);
        $this->assertSame('2026-03-10', optional($transfer->acceptance_intake_date)->format('Y-m-d'));

        $acceptedPatient = Patient::findOrFail($transfer->accepted_patient_id);
        $this->assertSame($destinationFacility->id, $acceptedPatient->facility_id);
        $this->assertSame($destinationProgram->id, $acceptedPatient->program_id);
        $this->assertSame($destinationBed->id, $acceptedPatient->bed_id);
        $this->assertNull($acceptedPatient->discharged_at);
        $this->assertNull($acceptedPatient->discharge_disposition);
        $this->assertNull($acceptedPatient->discharge_destination);
        $this->assertNull($acceptedPatient->leave_details);
        $this->assertSame('occupied', $destinationBed->status);

        $this->assertNull($sourcePatient->bed_id);
        $this->assertNotNull($sourcePatient->discharged_at);
    }

    public function test_rejecting_transfer_keeps_source_discharged(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        [$sourceFacility, $sourceProgram, , $sourceBed] = $this->createBedContext('Source Facility', 'Source Program', '101', 'A', 'occupied');
        [$destinationFacility, $destinationProgram] = $this->createBedContext('Destination Facility', 'Destination Program', '201', 'B');

        $sourcePatient = $this->createPatientOnBed($sourceBed, [
            'facility_id' => $sourceFacility->id,
            'program_id' => $sourceProgram->id,
        ]);

        $this->post("/beds/{$sourceBed->id}/discharge", [
            'patient_id' => $sourcePatient->id,
            'discharge_disposition' => 'Self Discharge',
            'discharge_destination' => 'Other',
            'leave_details' => 'Client requested move and it was denied.',
            'is_move' => true,
            'destination_facility_id' => $destinationFacility->id,
            'destination_program_id' => $destinationProgram->id,
        ])->assertSessionHasNoErrors();

        $transfer = PatientTransfer::query()->where('source_patient_id', $sourcePatient->id)->firstOrFail();
        $destinationUser = $this->createUser($destinationFacility->id, $destinationProgram->id);

        $this->actingAs($destinationUser);
        $response = $this->post("/transfers/{$transfer->id}/reject");
        $response->assertSessionHasNoErrors();

        $transfer->refresh();
        $sourcePatient->refresh();

        $this->assertSame('rejected', $transfer->status);
        $this->assertNotNull($transfer->reviewed_at);
        $this->assertNotNull($sourcePatient->discharged_at);
        $this->assertNull($sourcePatient->bed_id);
    }

    public function test_origin_staff_cannot_accept_destination_transfer(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        [$sourceFacility, $sourceProgram, , $sourceBed] = $this->createBedContext('Source Facility', 'Source Program', '101', 'A', 'occupied');
        [$destinationFacility, $destinationProgram, , $destinationBed] = $this->createBedContext('Destination Facility', 'Destination Program', '201', 'B', 'available');

        $sourcePatient = $this->createPatientOnBed($sourceBed, [
            'facility_id' => $sourceFacility->id,
            'program_id' => $sourceProgram->id,
        ]);

        $this->post("/beds/{$sourceBed->id}/discharge", [
            'patient_id' => $sourcePatient->id,
            'discharge_disposition' => 'Administrative Discharge',
            'discharge_destination' => 'Staying or living with friends, permanent tenure',
            'leave_details' => 'Move waiting destination review.',
            'is_move' => true,
            'destination_facility_id' => $destinationFacility->id,
            'destination_program_id' => $destinationProgram->id,
        ])->assertSessionHasNoErrors();

        $transfer = PatientTransfer::query()->where('source_patient_id', $sourcePatient->id)->firstOrFail();
        $originUser = $this->createUser($sourceFacility->id, $sourceProgram->id);

        $this->actingAs($originUser);
        $response = $this->post("/transfers/{$transfer->id}/accept", [
            'intake_date' => '2026-03-10',
            'bed_id' => $destinationBed->id,
        ]);

        $response->assertForbidden();
        $transfer->refresh();
        $this->assertSame('pending', $transfer->status);
    }

    public function test_accept_transfer_validates_destination_bed_belongs_to_destination_pair(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        [$sourceFacility, $sourceProgram, , $sourceBed] = $this->createBedContext('Source Facility', 'Source Program', '101', 'A', 'occupied');
        [$destinationFacility, $destinationProgram] = $this->createBedContext('Destination Facility', 'Destination Program', '201', 'B');
        [, , , $wrongBed] = $this->createBedContext('Wrong Facility', 'Wrong Program', '301', 'C', 'available');

        $sourcePatient = $this->createPatientOnBed($sourceBed, [
            'facility_id' => $sourceFacility->id,
            'program_id' => $sourceProgram->id,
        ]);

        $this->post("/beds/{$sourceBed->id}/discharge", [
            'patient_id' => $sourcePatient->id,
            'discharge_disposition' => 'Administrative Discharge',
            'discharge_destination' => 'Staying or living with friends, permanent tenure',
            'leave_details' => 'Move validation test.',
            'is_move' => true,
            'destination_facility_id' => $destinationFacility->id,
            'destination_program_id' => $destinationProgram->id,
        ])->assertSessionHasNoErrors();

        $transfer = PatientTransfer::query()->where('source_patient_id', $sourcePatient->id)->firstOrFail();
        $destinationUser = $this->createUser($destinationFacility->id, $destinationProgram->id);

        $this->actingAs($destinationUser);
        $response = $this->post("/transfers/{$transfer->id}/accept", [
            'intake_date' => '2026-03-10',
            'bed_id' => $wrongBed->id,
        ]);

        $response->assertSessionHasErrors(['bed_id']);
    }

    /**
     * @return array{0: Facility, 1: Program, 2: Room, 3: Bed}
     */
    private function createBedContext(
        string $facilityName,
        string $programName,
        string $roomName,
        string $bedNumber,
        string $bedStatus = 'available'
    ): array {
        $facility = Facility::create(['name' => $facilityName, 'notes' => null]);
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
     * @return array<string, mixed>
     */
    private function intakePayload(int $bedId, array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1990-01-02',
            'status' => 'referral',
            'referral_from' => 'HOSN',
            'insurance' => 'Medicaid',
            'intake_date' => '2026-03-04',
            'discharge_date' => null,
            'bed_id' => $bedId,
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
        ], $overrides);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createPatientOnBed(Bed $bed, array $overrides = []): Patient
    {
        $room = $bed->room()->firstOrFail();

        return Patient::create(array_merge([
            'facility_id' => $room->facility_id,
            'program_id' => $room->program_id,
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
            'bed_id' => $bed->id,
        ], $overrides));
    }

    private function createUser(?int $facilityId = null, ?int $programId = null, bool $isAdmin = false): User
    {
        $user = User::factory()->create([
            'is_admin' => $isAdmin,
            'can_login' => true,
            'facility_id' => $facilityId,
            'program_id' => $programId,
        ]);

        if ($programId) {
            $user->programs()->syncWithoutDetaching([$programId]);
        }

        return $user;
    }
}

