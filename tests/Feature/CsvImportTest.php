<?php

namespace Tests\Feature;

use App\Models\Bed;
use App\Models\Facility;
use App\Models\Program;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class CsvImportTest extends TestCase
{
    use RefreshDatabase;

    // ── Rooms & Beds Import ──────────────────────────────────

    public function test_rooms_beds_import_creates_rooms_and_beds(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $facility = Facility::create(['name' => 'Test Facility']);
        $program = Program::create(['name' => 'Test Program']);

        $csv = "room_name,bed_number,bed_type\nRoom A,1,single\nRoom A,2,double_top\nRoom B,1,ada_single\n";
        $file = UploadedFile::fake()->createWithContent('import.csv', $csv);

        $response = $this->post('/import/rooms-beds', [
            'facility_id' => $facility->id,
            'program_id' => $program->id,
            'file' => $file,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('import_result.success', true);
        $response->assertSessionHas('import_result.imported', 3);

        $this->assertDatabaseHas('rooms', ['name' => 'Room A', 'facility_id' => $facility->id, 'program_id' => $program->id]);
        $this->assertDatabaseHas('rooms', ['name' => 'Room B', 'facility_id' => $facility->id, 'program_id' => $program->id]);
        $this->assertDatabaseCount('beds', 3);
    }

    public function test_rooms_beds_import_rejects_invalid_bed_type(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $facility = Facility::create(['name' => 'F']);
        $program = Program::create(['name' => 'P']);

        $csv = "room_name,bed_number,bed_type\nRoom A,1,bunk\n";
        $file = UploadedFile::fake()->createWithContent('import.csv', $csv);

        $response = $this->post('/import/rooms-beds', [
            'facility_id' => $facility->id,
            'program_id' => $program->id,
            'file' => $file,
        ]);

        $response->assertSessionHas('import_result.success', false);
        $this->assertDatabaseCount('beds', 0);
    }

    public function test_rooms_beds_import_rejects_wrong_headers(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $facility = Facility::create(['name' => 'F']);
        $program = Program::create(['name' => 'P']);

        $csv = "name,number,type\nRoom A,1,single\n";
        $file = UploadedFile::fake()->createWithContent('import.csv', $csv);

        $response = $this->post('/import/rooms-beds', [
            'facility_id' => $facility->id,
            'program_id' => $program->id,
            'file' => $file,
        ]);

        $response->assertSessionHas('import_result.success', false);
    }

    public function test_rooms_beds_import_skips_existing_beds(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $facility = Facility::create(['name' => 'F']);
        $program = Program::create(['name' => 'P']);
        $room = Room::create(['name' => 'Room A', 'facility_id' => $facility->id, 'program_id' => $program->id]);
        Bed::create(['bed_number' => '1', 'bed_type' => 'single', 'room_id' => $room->id, 'status' => 'available']);

        $csv = "room_name,bed_number,bed_type\nRoom A,1,single\nRoom A,2,double_top\n";
        $file = UploadedFile::fake()->createWithContent('import.csv', $csv);

        $response = $this->post('/import/rooms-beds', [
            'facility_id' => $facility->id,
            'program_id' => $program->id,
            'file' => $file,
        ]);

        $response->assertSessionHas('import_result.imported', 1);
        $this->assertDatabaseCount('beds', 2);
    }

    public function test_rooms_beds_import_rejects_duplicate_entries_in_csv(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $facility = Facility::create(['name' => 'F']);
        $program = Program::create(['name' => 'P']);

        $csv = "room_name,bed_number,bed_type\nRoom A,1,single\nRoom A,1,double_top\n";
        $file = UploadedFile::fake()->createWithContent('import.csv', $csv);

        $response = $this->post('/import/rooms-beds', [
            'facility_id' => $facility->id,
            'program_id' => $program->id,
            'file' => $file,
        ]);

        $response->assertSessionHas('import_result.success', false);
        $this->assertDatabaseCount('beds', 0);
    }

    public function test_non_admin_cannot_import_rooms_beds_to_other_facility(): void
    {
        $facilityA = Facility::create(['name' => 'A']);
        $facilityB = Facility::create(['name' => 'B']);
        $program = Program::create(['name' => 'P']);

        $user = $this->createUser($facilityA->id, $program->id);
        $this->actingAs($user);

        $csv = "room_name,bed_number,bed_type\nRoom A,1,single\n";
        $file = UploadedFile::fake()->createWithContent('import.csv', $csv);

        $response = $this->post('/import/rooms-beds', [
            'facility_id' => $facilityB->id,
            'program_id' => $program->id,
            'file' => $file,
        ]);

        $response->assertForbidden();
    }

    // ── Patients Import ──────────────────────────────────────

    public function test_patients_import_creates_patients(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $facility = Facility::create(['name' => 'F']);
        $program = Program::create(['name' => 'P']);
        Room::create(['name' => 'R', 'facility_id' => $facility->id, 'program_id' => $program->id]);

        $csv = "first_name,last_name,dob,status,referral_from,insurance,intake_date\n";
        $csv .= "Jane,Doe,1990-01-15,referral,HOSN,Medicaid,2026-03-01\n";
        $csv .= "John,Smith,1985-06-20,walk_in,,,2026-03-05\n";
        $file = UploadedFile::fake()->createWithContent('patients.csv', $csv);

        $response = $this->post('/import/patients', [
            'facility_id' => $facility->id,
            'file' => $file,
        ]);

        $response->assertSessionHas('import_result.success', true);
        $response->assertSessionHas('import_result.imported', 2);

        $this->assertDatabaseHas('patients', ['first_name' => 'Jane', 'last_name' => 'Doe', 'status' => 'referral']);
        $this->assertDatabaseHas('patients', ['first_name' => 'John', 'last_name' => 'Smith', 'status' => 'walk_in']);
    }

    public function test_patients_import_validates_referral_from_required(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $facility = Facility::create(['name' => 'F']);

        $csv = "first_name,last_name,dob,status,referral_from,insurance,intake_date\n";
        $csv .= "Jane,Doe,1990-01-15,referral,,,2026-03-01\n";
        $file = UploadedFile::fake()->createWithContent('patients.csv', $csv);

        $response = $this->post('/import/patients', [
            'facility_id' => $facility->id,
            'file' => $file,
        ]);

        $response->assertSessionHas('import_result.success', false);
        $this->assertDatabaseCount('patients', 0);
    }

    public function test_patients_import_validates_date_format(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $facility = Facility::create(['name' => 'F']);

        $csv = "first_name,last_name,dob,status,referral_from,insurance,intake_date\n";
        $csv .= "Jane,Doe,01/15/1990,walk_in,,,2026-03-01\n";
        $file = UploadedFile::fake()->createWithContent('patients.csv', $csv);

        $response = $this->post('/import/patients', [
            'facility_id' => $facility->id,
            'file' => $file,
        ]);

        $response->assertSessionHas('import_result.success', false);
        $this->assertDatabaseCount('patients', 0);
    }

    public function test_non_admin_cannot_import_patients_to_other_facility(): void
    {
        $facilityA = Facility::create(['name' => 'A']);
        $facilityB = Facility::create(['name' => 'B']);
        $program = Program::create(['name' => 'P']);

        $user = $this->createUser($facilityA->id, $program->id);
        $this->actingAs($user);

        $csv = "first_name,last_name,dob,status,referral_from,insurance,intake_date\n";
        $csv .= "Jane,Doe,1990-01-15,walk_in,,,2026-03-01\n";
        $file = UploadedFile::fake()->createWithContent('patients.csv', $csv);

        $response = $this->post('/import/patients', [
            'facility_id' => $facilityB->id,
            'file' => $file,
        ]);

        $response->assertForbidden();
    }

    // ── Template Downloads ───────────────────────────────────

    public function test_rooms_beds_template_downloads(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $response = $this->get('/import/template/rooms-beds');
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_patients_template_downloads(): void
    {
        $admin = $this->createUser(isAdmin: true);
        $this->actingAs($admin);

        $response = $this->get('/import/template/patients');
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    // ── Helpers ──────────────────────────────────────────────

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
