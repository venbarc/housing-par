<?php

namespace Database\Seeders;

use App\Models\Bed;
use App\Models\Facility;
use App\Models\Patient;
use App\Models\Program;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Default admin user
        $admin = User::firstOrNew(['email' => 'admin@hospital.local']);
        $admin->name = 'Admin Nurse';
        $admin->is_admin = true;
        $admin->can_login = true;
        if (! $admin->exists) {
            $admin->password = Hash::make('password');
        }
        $admin->save();

        $programs = [
            'Navigation Center Info' => Program::firstOrCreate(['name' => 'Navigation Center Info'], ['notes' => 'Default program']),
            'Anthem BH' => Program::firstOrCreate(['name' => 'Anthem BH'], ['notes' => 'Anthem behavioral health']),
            'CSP' => Program::firstOrCreate(['name' => 'CSP'], ['notes' => 'Community Support Program']),
            'County' => Program::firstOrCreate(['name' => 'County'], ['notes' => 'County program']),
            'Ndoc' => Program::firstOrCreate(['name' => 'Ndoc'], ['notes' => 'NDOC program']),
        ];

        $facilities = [
            'Nellis' => Facility::firstOrCreate(['name' => 'Nellis'], ['notes' => '2112 N Nellis Las Vegas, NV 89115']),
            'Navigation Center' => Facility::firstOrCreate(['name' => 'Navigation Center'], ['notes' => '2805 E Fremont St (Old Annex)']),
        ];

        $roomSeeds = [
            // Nellis
            ['facility' => 'Nellis', 'program' => 'Anthem BH', 'rooms' => ['101', '102']],
            ['facility' => 'Nellis', 'program' => 'CSP', 'rooms' => ['201', '202']],

            // Navigation Center
            ['facility' => 'Navigation Center', 'program' => 'County', 'rooms' => ['301', '302']],
            ['facility' => 'Navigation Center', 'program' => 'CSP', 'rooms' => ['401', '402']],
            ['facility' => 'Navigation Center', 'program' => 'Ndoc', 'rooms' => ['501', '502']],
        ];

        foreach ($roomSeeds as $seed) {
            $facility = $facilities[$seed['facility']];
            $program = $programs[$seed['program']];

            foreach ($seed['rooms'] as $roomName) {
                $room = Room::firstOrCreate(
                    [
                        'facility_id' => $facility->id,
                        'program_id' => $program->id,
                        'name' => $roomName,
                    ],
                    ['notes' => "{$seed['facility']} • {$seed['program']}"]
                );

                Bed::firstOrCreate(
                    ['room_id' => $room->id, 'bed_number' => 'A'],
                    ['bed_type' => 'single', 'status' => 'available']
                );

                Bed::firstOrCreate(
                    ['room_id' => $room->id, 'bed_number' => 'B'],
                    ['bed_type' => 'ada_single', 'status' => 'available']
                );
            }
        }

        // Seed a few unassigned patients so bed allocation can pick from a dropdown.
        $today = now()->toDateString();

        Patient::firstOrCreate(
            ['first_name' => 'Alex', 'last_name' => 'Nellis', 'dob' => '1990-01-15', 'facility_id' => $facilities['Nellis']->id, 'program_id' => $programs['Anthem BH']->id],
            ['status' => 'referral', 'referral_from' => 'Cares Campus', 'intake_date' => $today, 'bed_id' => null]
        );
        Patient::firstOrCreate(
            ['first_name' => 'Jordan', 'last_name' => 'Nellis', 'dob' => '1988-06-02', 'facility_id' => $facilities['Nellis']->id, 'program_id' => $programs['CSP']->id],
            ['status' => 'walk_in', 'referral_from' => null, 'intake_date' => $today, 'bed_id' => null]
        );

        Patient::firstOrCreate(
            ['first_name' => 'Casey', 'last_name' => 'NavCenter', 'dob' => '1992-09-10', 'facility_id' => $facilities['Navigation Center']->id, 'program_id' => $programs['County']->id],
            ['status' => 'referral', 'referral_from' => 'HOSN', 'intake_date' => $today, 'bed_id' => null]
        );
        Patient::firstOrCreate(
            ['first_name' => 'Taylor', 'last_name' => 'NavCenter', 'dob' => '1995-03-22', 'facility_id' => $facilities['Navigation Center']->id, 'program_id' => $programs['CSP']->id],
            ['status' => 'walk_in', 'referral_from' => null, 'intake_date' => $today, 'bed_id' => null]
        );
        Patient::firstOrCreate(
            ['first_name' => 'Riley', 'last_name' => 'NavCenter', 'dob' => '1985-12-05', 'facility_id' => $facilities['Navigation Center']->id, 'program_id' => $programs['Ndoc']->id],
            ['status' => 'referral', 'referral_from' => 'NDOC', 'intake_date' => $today, 'bed_id' => null]
        );

        // Example staff accounts (password: "password")
        $nellisUser = User::firstOrCreate(
            ['email' => 'nellis.staff@hospital.local'],
            [
                'name' => 'Nellis Staff',
                'password' => Hash::make('password'),
                'is_admin' => false,
                'can_login' => true,
                'facility_id' => $facilities['Nellis']->id,
                'program_id' => $programs['Anthem BH']->id,
            ]
        );
        $nellisUser->programs()->sync([$programs['Anthem BH']->id, $programs['CSP']->id]);

        $navUser = User::firstOrCreate(
            ['email' => 'nav.staff@hospital.local'],
            [
                'name' => 'Navigation Center Staff',
                'password' => Hash::make('password'),
                'is_admin' => false,
                'can_login' => true,
                'facility_id' => $facilities['Navigation Center']->id,
                'program_id' => $programs['County']->id,
            ]
        );
        $navUser->programs()->sync([$programs['County']->id, $programs['CSP']->id, $programs['Ndoc']->id]);
    }
}
