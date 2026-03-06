<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('source_bed_id')->nullable()->constrained('beds')->nullOnDelete();
            $table->foreignId('source_facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignId('source_program_id')->constrained('programs')->cascadeOnDelete();
            $table->foreignId('destination_facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignId('destination_program_id')->constrained('programs')->cascadeOnDelete();
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->foreignId('accepted_patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->date('acceptance_intake_date')->nullable();
            $table->foreignId('acceptance_bed_id')->nullable()->constrained('beds')->nullOnDelete();
            $table->timestamps();

            $table->index(['destination_facility_id', 'destination_program_id'], 'patient_transfers_destination_index');
            $table->index(['status', 'destination_facility_id', 'destination_program_id'], 'patient_transfers_status_destination_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_transfers');
    }
};

