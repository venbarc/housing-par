<?php

namespace Database\Seeders;

use App\Models\Bed;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\User;
use App\Models\Ward;
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

        // Wards
        $wardA = Ward::create(['name' => 'General Medicine', 'floor' => '1', 'description' => 'General patient care']);
        $wardB = Ward::create(['name' => 'Surgical', 'floor' => '2', 'description' => 'Post-operative recovery']);
        $wardC = Ward::create(['name' => 'Pediatrics', 'floor' => '3', 'description' => 'Children\'s ward']);
        $wardD = Ward::create(['name' => 'ICU', 'floor' => '4', 'description' => 'Intensive care unit']);

        // Patients
        $p1 = Patient::create([
            'name' => 'Alice Johnson',
            'age' => 45,
            'gender' => 'Female',
            'diagnosis' => 'Hypertension',
            'status' => 'stable',
            'doctor' => 'Dr. Smith',
            'admission_date' => now()->subDays(3)->toDateString(),
            'contact' => '555-0101',
            'notes' => 'Monitoring blood pressure',
        ]);

        $p2 = Patient::create([
            'name' => 'Bob Martinez',
            'age' => 62,
            'gender' => 'Male',
            'diagnosis' => 'Post-op hip replacement',
            'status' => 'recovering',
            'doctor' => 'Dr. Adams',
            'admission_date' => now()->subDays(5)->toDateString(),
            'contact' => '555-0102',
        ]);

        $p3 = Patient::create([
            'name' => 'Carol White',
            'age' => 8,
            'gender' => 'Female',
            'diagnosis' => 'Pneumonia',
            'status' => 'critical',
            'doctor' => 'Dr. Lee',
            'admission_date' => now()->subDays(1)->toDateString(),
            'contact' => '555-0103',
        ]);

        // Beds
        $b1 = Bed::create([
            'bed_number' => '101',
            'ward_id' => $wardA->id,
            'room' => 'A1',
            'status' => 'occupied',
            'pos_x' => 24,
            'pos_y' => 24,
            'patient_id' => $p1->id,
        ]);
        $p1->update(['bed_id' => $b1->id]);

        $b2 = Bed::create([
            'bed_number' => '201',
            'ward_id' => $wardB->id,
            'room' => 'B1',
            'status' => 'occupied',
            'pos_x' => 292,
            'pos_y' => 24,
            'patient_id' => $p2->id,
        ]);
        $p2->update(['bed_id' => $b2->id]);

        $b3 = Bed::create([
            'bed_number' => '301',
            'ward_id' => $wardC->id,
            'room' => 'C1',
            'status' => 'occupied',
            'pos_x' => 560,
            'pos_y' => 24,
            'patient_id' => $p3->id,
        ]);
        $p3->update(['bed_id' => $b3->id]);

        Bed::create(['bed_number' => '102', 'ward_id' => $wardA->id, 'room' => 'A2', 'status' => 'available', 'pos_x' => 24, 'pos_y' => 252]);
        Bed::create(['bed_number' => '103', 'ward_id' => $wardA->id, 'room' => 'A3', 'status' => 'cleaning', 'pos_x' => 292, 'pos_y' => 252]);
        Bed::create(['bed_number' => '401', 'ward_id' => $wardD->id, 'room' => 'D1', 'status' => 'maintenance', 'pos_x' => 560, 'pos_y' => 252]);

        // Notifications
        Notification::create(['type' => 'admission', 'message' => 'New patient admitted: Alice Johnson', 'is_read' => false]);
        Notification::create(['type' => 'bed_occupied', 'message' => 'Bed 101 assigned to Alice Johnson', 'is_read' => true]);
        Notification::create(['type' => 'admission', 'message' => 'New patient admitted: Bob Martinez', 'is_read' => false]);
        Notification::create(['type' => 'critical', 'message' => 'Patient Carol White marked critical', 'is_read' => false]);
        Notification::create(['type' => 'bed_occupied', 'message' => 'Bed 301 assigned to Carol White', 'is_read' => false]);
    }
}
