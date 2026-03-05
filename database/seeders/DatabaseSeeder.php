<?php

namespace Database\Seeders;

use App\Models\Bed;
use App\Models\Facility;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Default admin user
        User::firstOrCreate(
            ['email' => 'admin@hospital.local'],
            [
                'name' => 'Admin Nurse',
                'password' => Hash::make('password'),
            ]
        );

        $facility = Facility::firstOrCreate(
            ['name' => 'Default Facility'],
            ['notes' => 'Seeded default facility']
        );

        // Rooms
        $room101 = Room::create(['name' => '101', 'notes' => 'Sample room', 'facility_id' => $facility->id]);
        $room102 = Room::create(['name' => '102', 'notes' => 'Sample room', 'facility_id' => $facility->id]);
        $room103 = Room::create(['name' => '103', 'notes' => 'Sample room', 'facility_id' => $facility->id]);

        // Beds
        $bed101a = Bed::create(['bed_number' => 'A', 'bed_type' => 'single', 'room_id' => $room101->id, 'status' => 'occupied']);
        Bed::create(['bed_number' => 'B', 'bed_type' => 'ada_single', 'room_id' => $room101->id, 'status' => 'available']);

        $bed102top = Bed::create(['bed_number' => 'Top', 'bed_type' => 'double_top', 'room_id' => $room102->id, 'status' => 'occupied']);
        Bed::create(['bed_number' => 'Bottom', 'bed_type' => 'double_bottom', 'room_id' => $room102->id, 'status' => 'available']);

        Bed::create(['bed_number' => 'A', 'bed_type' => 'single', 'room_id' => $room103->id, 'status' => 'available']);
        Bed::create(['bed_number' => 'B', 'bed_type' => 'single', 'room_id' => $room103->id, 'status' => 'maintenance']);

        // Patients (assigned to beds via bed_id)
        Patient::create([
            'first_name' => 'Levi',
            'last_name' => 'Braziel',
            'dob' => '1992-07-30',
            'status' => 'referral',
            'referral_from' => 'HOSN',
            'insurance' => null,
            'intake_date' => now()->subDays(3)->toDateString(),
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
            'bed_id' => $bed101a->id,
        ]);

        Patient::create([
            'first_name' => 'Tyler',
            'last_name' => 'Miller-Jones',
            'dob' => '1992-07-30',
            'status' => 'walk_in',
            'referral_from' => null,
            'insurance' => null,
            'intake_date' => now()->subDays(1)->toDateString(),
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
            'vital_documents_access' => false,
            'phone_access' => true,
            'employed_or_income' => false,
            'support_system' => false,
            'is_veteran' => true,
            'veteran_connected_services' => 'no',
            'seeking_mat_services' => false,
            'enrolled_mat_services' => false,
            'arrests_past_12_months' => '0',
            'arrests_lifetime' => '0',
            'jail_days_past_12_months' => '0',
            'jail_days_lifetime' => '0',
            'prison_time_past_12_months' => '0',
            'prison_time_lifetime' => '0',
            'bed_id' => $bed102top->id,
        ]);

        // Notifications
        Notification::create(['type' => 'admission', 'message' => 'New intake: Levi Braziel', 'is_read' => false]);
        Notification::create(['type' => 'bed_occupied', 'message' => 'Bed A assigned to Levi Braziel', 'is_read' => true]);
        Notification::create(['type' => 'admission', 'message' => 'New intake: Tyler Miller-Jones', 'is_read' => false]);
        Notification::create(['type' => 'bed_occupied', 'message' => 'Bed Top assigned to Tyler Miller-Jones', 'is_read' => false]);
    }
}
