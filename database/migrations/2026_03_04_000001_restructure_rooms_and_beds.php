<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create rooms table
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Alter beds table - drop old columns first
        Schema::table('beds', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
            $table->dropColumn('patient_id');
            $table->dropForeign(['ward_id']);
            $table->dropColumn('ward_id');
            $table->dropColumn('room');
        });

        // Add new columns to beds
        Schema::table('beds', function (Blueprint $table) {
            $table->foreignId('room_id')->after('bed_number')->constrained()->cascadeOnDelete();
            $table->boolean('is_double_occupancy')->default(false)->after('pos_y');
        });

        // 3. Add possible_discharge_date to patients
        Schema::table('patients', function (Blueprint $table) {
            $table->date('possible_discharge_date')->nullable()->after('admission_date');
        });

        // 4. Drop wards table
        Schema::dropIfExists('wards');
    }

    public function down(): void
    {
        // Recreate wards table
        Schema::create('wards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('floor')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Reverse beds changes
        Schema::table('beds', function (Blueprint $table) {
            $table->foreignId('ward_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('room')->default('');
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
        });

        Schema::table('beds', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropColumn('room_id');
            $table->dropColumn('is_double_occupancy');
        });

        // Remove possible_discharge_date from patients
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('possible_discharge_date');
        });

        // Drop rooms
        Schema::dropIfExists('rooms');
    }
};
